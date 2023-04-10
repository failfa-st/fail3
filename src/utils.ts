import fs from "node:fs/promises";
import path from "node:path";

import type { AxiosError } from "axios";
import filenamify from "filenamify";

import type AI from "./ai/index.js";
import type { FileInfo, FileType, Sprint, UserStory, ErrorData } from "./types.js";

/**
 * Sends a request to the AI system and returns a promise that resolves to the AI's response.
 *
 * @param {string} task - The task to be processed by the AI.
 * @param {AI} ai - The AI object to be used for processing the task.
 * @returns {Promise<Answer>} A promise that resolves to the AI's response to the task.
 */
export async function sendRequest(task: string, ai: AI) {
	ai.task = task;
	return ai.answer;
}

/**
 * Builds a prompt for defining a sprint and its associated user stories.
 *
 * @param {string} sprint - The name of the sprint being defined.
 * @returns {string} The prompt for defining the sprint.
 */
export function buildSprintPrompt(sprint: string) {
	return `# Sprint: ${sprint}

## YOUR TASK

Define the scope and complexity (1-5) of the "Sprint".
Create a "User Story" for each "Feature" in this "Sprint"
All "Acceptance Criteria" are very clear and defined exactly

## DATA TYPES

interface UserStory {
    /* User Story Format: "As a User, I want …, so that …" */
	story: string;
	complexity: number;
	/* Name of the "Feature" */
	feature: string;
	/* Acceptance criteria for the "Feature" */
	acceptanceCriteria: string[];
}

interface Sprint {
	scope: string;
	complexity: number;
	userStories: UserStory[];
}

## OUTPUT FORMAT

valid JSON of "interface Sprint".
`;
}

/**
 * Prepares a sprint for processing by the AI system and returns a promise that resolves to the AI's
 * response to the sprint.
 *
 * @param {string} sprint - The string input representing the sprint to be processed.
 * @param {AI} ai - The AI object representing the project manager role.
 * @returns {Promise<Answer>} A promise that resolves to the AI's response to the sprint.
 */
export async function prepareSprint(sprint: string, ai: AI) {
	const task = buildSprintPrompt(sprint);
	return sendRequest(task, ai);
}

/**
 * Returns the filename for a file based on a name, directory, and file type.
 *
 * @param {string} name - The name to use in the filename.
 * @param {string} directory - The directory in which to place the file.
 * @param {FileType} type - The file type.
 * @returns {string} The filename.
 */
export function getFilename(name: string, directory: string, type: FileType) {
	const safeName = filenamify(name);
	return `${directory}/${safeName.toLocaleLowerCase().replace(/\s+/g, "_")}.${type}`;
}

/**
 * Creates a new sprint and saves it to a JSON file.
 * @param {string} goal - The goal of the sprint.
 * @param {AI} ai - The AI object representing the project manager.
 * @returns {Promise<FileInfo>} A promise that resolves to an object containing the file path and
 *   content of the newly created sprint file.
 */
export async function createSprint(goal: string, ai: AI) {
	console.log(`⏳ - Preparing Sprint for "${goal}"`);
	const task = await prepareSprint(goal, ai);
	const json: Sprint = JSON.parse(task.answer);
	const filePath = path.join(process.cwd(), getFilename(json.scope, "sprints", "json"));
	const content = JSON.stringify(json, null, 2);
	await fs.writeFile(filePath, content);
	return { filePath, content };
}

/**
 * Returns a prompt message for creating a cucumber feature for a user story.
 *
 * @param {UserStory} story - The user story for which to create the cucumber feature.
 * @returns {string} The prompt message for creating a cucumber feature.
 */
export function buildFeaturePrompt(story: UserStory) {
	return `# Feature: ${story.feature}

## YOUR TASK

Create a cucumber feature for this user story:

${JSON.stringify(story, null, 2).replaceAll("  ", "\t")}

## CODE GUIDE

Split "User Story" on "," into new lines (keep ",")
Add Background
Add Scenarios

## OUTPUT FORMAT

valid Cucumber feature file
`;
}

/**
 * Prepares a cucumber feature for a user story using the given QA engineer AI system.
 *
 * @param {UserStory} story - The user story for which to create the cucumber feature.
 * @param {AI} ai - The QA engineer AI system to use for generating the feature.
 * @returns {Promise<Answer>} A promise that resolves to the AI's response to the sprint.
 */
export async function prepareFeature(story: UserStory, ai: AI) {
	const task = buildFeaturePrompt(story);
	return sendRequest(task, ai);
}

/**
 * Creates a Cucumber feature file for a given user story and writes it to disk.
 *
 * @param {UserStory} story - The user story to create a feature file for.
 * @param {AI} ai - The AI representing the QA Engineer responsible for writing the feature file.
 * @returns {Promise<FileInfo>} A promise that resolves to an object containing the file path and
 *   content of the created feature file.
 */
export async function createFeature(story: UserStory, ai: AI) {
	const task = await prepareFeature(story, ai);
	const filePath = path.join(process.cwd(), getFilename(story.feature, "cypress/e2e", "feature"));
	const content = task.answer;
	await fs.writeFile(filePath, content);
	return { filePath, content };
}

/**
 * Returns a prompt to create a Cypress test for the given feature.
 *
 * @param {string} feature - The feature for which to create the Cypress test.
 * @returns {string} The prompt for creating a Cypress test.
 */
export function buildCypressTestPrompt(feature: string) {
	return `# E2E Tests

## YOUR TASK

create a cypress test for the feature file using "@badeball/cypress-cucumber-preprocessor":

${feature}

## TEMPLATE

import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I visit home", () => {
  cy.visit("/");
});

## CODE GUIDE

Use typescript
Use data-selectors e.g. cy.get('[data-cy="submit"]')
Exclusively the test file
Exclusive use Given, When, Then (no aliases, like And, But)
No comments
No markdown

## OUTPUT FORMAT

valid pure TypeScript
`;
}

/**
 * Returns the response from the AI for the prompt to create a Cypress test for the given feature.
 *
 * @param {string} feature - The feature for which to create the Cypress test.
 * @param {AI} ai - The AI object to use for generating the Cypress test.
 * @returns {Promise<Answer>} A promise that resolves to the AI's response for creating a Cypress
 *   test.
 */
export async function prepareCypressTest(feature: string, ai: AI) {
	const task = buildCypressTestPrompt(feature);
	return sendRequest(task, ai);
}

/**
 * Creates a Cypress test file for the given feature file.
 *
 * @param {FileInfo} featureFile - The feature file for which to create the Cypress test file.
 * @param {AI} ai - The AI object to use for generating the Cypress test.
 * @returns {Promise<FileInfo>} A promise that resolves to an object containing the file path and
 *   content of the Cypress test file.
 */
export async function createCypressTest(featureFile: FileInfo, ai: AI) {
	const task = await prepareCypressTest(featureFile.content, ai);
	const { name } = path.parse(featureFile.filePath);
	const filePath = path.join(process.cwd(), getFilename(name, "cypress/e2e", "ts"));
	const content = task.answer;
	await fs.writeFile(filePath, content);
	return { filePath, content };
}

/**
 * Generates an array of schedule times, based on a length and a delay between items.
 *
 * @param {number} length - The length of the array to generate.
 * @param {number} delay - The delay in milliseconds between each item. Default is 10 seconds.
 *
 * @returns {number[]} An array of schedule times, based on the length and delay.
 */
export function getSchedule(length: number, delay = 10_000) {
	const now = Date.now();
	return Array.from({ length }, (_, index) => now + delay + index * delay);
}

/**
 * Waits until the specified timestamp before resolving the Promise.
 *
 * @param {number} timestamp - The Unix timestamp to wait for.
 * @returns {Promise<void>} - A Promise that resolves when the specified timestamp is reached.
 */
export async function wait(timestamp) {
	const now = Date.now();
	const delay = timestamp - now;
	return new Promise(resolve => {
		setTimeout(resolve, delay);
	});
}

/**
 * Handles errors for HTTP requests by logging the error details to the console.
 * If the error has a response, it will log the error data and status details.
 * If the error does not have a response, it will log the error object directly.
 * @param {AxiosError<ErrorData>} error - The error object to handle.
 */
export function handleError(error: AxiosError<ErrorData>) {
	if (Object.hasOwn(error, "response")) {
		console.log("ErrorData:", error.response.data);
		const { status, statusText, data } = error.response;
		console.error(status, data?.error?.message ?? statusText);
	} else {
		console.error(error);
	}
}
