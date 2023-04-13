import fs from "node:fs/promises";
import path from "node:path";

import type AI from "../../ai/index.ts";
import { sendRequest } from "../../ai/utils.ts";
import { extractMarkdownCodeBlock } from "../../parsers/index.ts";
import { getFilename } from "../../utils/files.ts";
import { addNewlineAtEnd } from "../../utils/string.ts";
import type { FileInfo, UserStory } from "../types.ts";

/**
 * Returns a prompt to create a Cypress test for the given feature.
 *
 * @param {string} feature - The feature for which to create the Cypress test.
 * @returns {string} The prompt for creating a Cypress test.
 */
export function buildPrompt(story: UserStory, dataModel: string) {
	return `# Component

## YOUR TASK

create a component for this user story:

${JSON.stringify(story)}

## DATA MODEL

${dataModel || "no data required"}

## CODE GUIDE

Use Nextjs
Use typescript
Use import-alias @/*
Use useSWR (GET)
Use @mui/material
Use axios (POST,PUT,DELETE)

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
export async function prepare(
	{ story, dataModel }: { story: UserStory; dataModel: string },
	ai: AI
) {
	const task = buildPrompt(story, dataModel);
	return sendRequest(task, ai);
}

export interface PageData {
	filePath: string;
	contentData: {
		story: UserStory;
		dataModelFile: FileInfo;
	};
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
export async function create(pageData: PageData, ai: AI, { cwd }: { cwd: string }) {
	const task = await prepare(
		{
			story: pageData.contentData.story,
			dataModel: pageData.contentData.dataModelFile.content,
		},
		ai
	);

	const filePath = path.join(cwd, getFilename(pageData.filePath, "components", "tsx"));

	const extractedAnswer = extractMarkdownCodeBlock(task.answer);
	const content = addNewlineAtEnd(extractedAnswer.content);
	await fs.writeFile(filePath, content);

	return { filePath, content };
}
