import fs from "node:fs/promises";
import path from "node:path";

import type AI from "../../ai/index.js";
import { sendRequest } from "../../ai/utils.js";
import { extractMarkdownCodeBlock } from "../../parsers/index.js";
import { getFilename } from "../../utils/files.js";
import { addNewlineAtEnd } from "../../utils/string.js";
import type { FileInfo } from "../types.js";

/**
 * Returns a prompt to create a Cypress test for the given feature.
 *
 * @param {string} feature - The feature for which to create the Cypress test.
 * @returns {string} The prompt for creating a Cypress test.
 */
export function buildPrompt(dataModel: string) {
	return `# Serverless Function

## YOUR TASK

create a serverless function for the "DATA MODEL":

## DATA MODEL

${dataModel}

## CODE GUIDE

Use Nextjs API routes
Use typescript
Use switch-case for request.method
Use prisma as database ORM

## OUTPUT FORMAT

valid pure TypeScript and NOTHING ELSE
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
export async function prepare(dataModel: string, ai: AI) {
	const task = buildPrompt(dataModel);
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
export async function create(dataModelFile: FileInfo, ai: AI, { cwd }: { cwd: string }) {
	const task = await prepare(dataModelFile.content, ai);
	const filePath = path.join(cwd, getFilename(dataModelFile.filePath, "pages/api", "ts"));

	const extractedAnswer = extractMarkdownCodeBlock(task.answer);
	const content = addNewlineAtEnd(extractedAnswer.content);
	await fs.writeFile(filePath, content);

	return { filePath, content };
}
