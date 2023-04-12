import fs from "node:fs/promises";
import path from "node:path";

import type AI from "../../ai/index.js";
import { sendRequest } from "../../ai/utils.js";
import { trim } from "../../parsers/index.js";
import { getFilename } from "../../utils/files.js";
import { addNewlineAtEnd, dedent } from "../../utils/string.js";
import type { UserStory } from "../types.js";

/**
 * Returns a prompt message for creating a cucumber feature for a user story.
 *
 * @param {UserStory} story - The user story for which to create the cucumber feature.
 * @returns {string} The prompt message for creating a cucumber feature.
 */
export function buildPrompt(story: UserStory) {
	return trim(dedent`
	# Feature: ${story.feature}

	## YOUR TASK

	Create a Cucumber Feature for this user story:

	${JSON.stringify(story)}

	## CODE GUIDE

	Use Cucumber
	Split "User Story" on "," into new lines (keep ",")
	Add Background
	Add Scenarios

	## OUTPUT FORMAT

	valid Cucumber Feature file and NOTHING ELSE
	`);
}

/**
 * Prepares a cucumber feature for a user story using the given QA engineer AI system.
 *
 * @param {UserStory} story - The user story for which to create the cucumber feature.
 * @param {AI} ai - The QA engineer AI system to use for generating the feature.
 * @returns {Promise<Answer>} A promise that resolves to the AI's response to the sprint.
 */
export async function prepare(story: UserStory, ai: AI) {
	const task = buildPrompt(story);
	return sendRequest(task, ai);
}

/**
 * Creates a Cucumber feature file for a given user story and writes it to disk.
 *
 * @param {UserStory} story - The user story to create a feature file for.
 * @param {AI} ai - The AI representing the QA Engineer responsible for writing the feature file.
 * @param cwd - The current working directory.
 * @returns {Promise<FileInfo>} A promise that resolves to an object containing the file path and
 *   content of the created feature file.
 */
export async function create(story: UserStory, ai: AI, { cwd }: { cwd: string }) {
	const task = await prepare(story, ai);
	const filePath = path.join(cwd, getFilename(story.feature, "cypress/e2e", "feature"));
	const content = addNewlineAtEnd(task.answer);
	await fs.writeFile(filePath, content);
	return { filePath, content };
}
