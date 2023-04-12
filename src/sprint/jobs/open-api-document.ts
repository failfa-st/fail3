import fs from "node:fs/promises";
import path from "node:path";

import jsYaml from "js-yaml";

import type AI from "../../ai/index.js";
import { sendRequest } from "../../ai/utils.js";
import { getFilename } from "../../utils/files.js";
import { addNewlineAtEnd } from "../../utils/string.js";
import type { UserStory } from "../types.js";

/**
 * Returns a prompt to create a Cypress test for the given feature.
 *
 * @param {string} feature - The feature for which to create the Cypress test.
 * @returns {string} The prompt for creating a Cypress test.
 */
export function buildPrompt(story: UserStory) {
	return `# OpenAPI Document File

## YOUR TASK

Create an openai document for this user story if required (if no data is required return null):

${JSON.stringify(story)}

## TEMPLATE

openapi: 3.1.0
info:
  title: A minimal OpenAPI document
  version: 0.0.1
paths: {}

## OUTPUT FORMAT

valid pure yaml
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
export async function prepare(story: UserStory, ai: AI) {
	const task = buildPrompt(story);
	return sendRequest(task, ai);
}

/**
 * Creates a Cypress test file for the given feature file.
 *
 * @param {FileInfo} featureFile - The feature file for which to create the Cypress test file.
 * @param {AI} ai - The AI object to use for generating the Cypress test.
 * @param cwd - The current working directory.
 * @returns {Promise<FileInfo>} A promise that resolves to an object containing the file path and
 *   content of the Cypress test file.
 */

export async function create(story: UserStory, ai: AI, { cwd }: { cwd: string }) {
	const task = await prepare(story, ai);
	const filePath = path.join(cwd, getFilename(story.feature, "openapi", "yaml"));

	if (task.answer.trim() !== "null") {
		const content = addNewlineAtEnd(task.answer);
		await fs.writeFile(filePath, content);

		const filePathJson = path.join(cwd, getFilename(story.feature, "openapi", "json"));
		const answerJson = jsYaml.load(task.answer);
		const contentJson = addNewlineAtEnd(JSON.stringify(answerJson, null, 2));
		const contentJsonMin = addNewlineAtEnd(JSON.stringify(answerJson));
		await fs.writeFile(filePathJson, contentJson);

		return { filePath: filePathJson, content: contentJsonMin };
	}

	return { filePath: "", content: "" };
}
