import fs from "node:fs/promises";
import path from "node:path";

import type AI from "../../ai/index.js";
import { sendRequest } from "../../ai/utils.js";
import { trim } from "../../parsers/index.js";
import { getFilename } from "../../utils/files.js";
import { addNewlineAtEnd, dedent } from "../../utils/string.js";
import type { FileInfo } from "../types.js";

/**
 * Returns a prompt to create a Cypress test for the given feature.
 *
 * @param {string} feature - The feature for which to create the Cypress test.
 * @returns {string} The prompt for creating a Cypress test.
 */
export function buildPrompt(feature: string) {
	return trim(dedent`
	# E2E Tests

	## YOUR TASK

	create a cypress test for the feature file using "@badeball/cypress-cucumber-preprocessor":

	${feature}

	## TEMPLATE

	import { When } from "@badeball/cypress-cucumber-preprocessor";

	When("I click submit", () => {
	  cy.get('[data-cy="submit"]').click();
	});

	## CODE GUIDE

	Use typescript
	Exclusive use Given, When, Then (no aliases, like And, But)

	## OUTPUT FORMAT

	valid pure TypeScript and NOTHING ELSE
	`);
}

/**
 * Returns the response from the AI for the prompt to create a Cypress test for the given feature.
 *
 * @param {string} feature - The feature for which to create the Cypress test.
 * @param {AI} ai - The AI object to use for generating the Cypress test.
 * @returns {Promise<Answer>} A promise that resolves to the AI's response for creating a Cypress
 *   test.
 */
export async function prepare(feature: string, ai: AI) {
	const task = buildPrompt(feature);
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
export async function create(featureFile: FileInfo, ai: AI, { cwd }: { cwd: string }) {
	const task = await prepare(featureFile.content, ai);
	const { name } = path.parse(featureFile.filePath);
	const filePath = path.join(cwd, getFilename(name, "cypress/e2e", "ts"));
	const content = addNewlineAtEnd(task.answer);
	await fs.writeFile(filePath, content);
	return { filePath, content };
}
