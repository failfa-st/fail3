import fs from "node:fs/promises";
import path from "node:path";

import type AI from "../../ai/index.js";
import { sendRequest } from "../../ai/utils.js";
import parsers, { trim } from "../../parsers/index.js";
import { getFilename } from "../../utils/files.js";
import { addNewlineAtEnd, dedent } from "../../utils/string.js";
import type { Sprint } from "../types.js";

/**
 * Builds a prompt for defining a sprint and its associated user stories.
 *
 * @param {string} sprint - The name of the sprint being defined.
 * @returns {string} The prompt for defining the sprint.
 */
export function buildPrompt(sprint: string) {
	return trim(dedent`
	# Sprint: ${sprint}

	## YOUR TASK

	Define the scope and complexity of the "Sprint".
	Create a "User Story" for each "Feature" in this "Sprint"
	All "Acceptance Criteria" are very clear and defined exactly

	## DATA TYPES

	interface UserStory {
	  /* User Story Format: "As a User, I want …, so that …" */
	  story: string;
	  complexity: number; // (1-5)
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
	`);
}

/**
 * Prepares a sprint for processing by the AI system and returns a promise that resolves to the AI's
 * response to the sprint.
 *
 * @param {string} sprint - The string input representing the sprint to be processed.
 * @param {AI} ai - The AI object representing the project manager role.
 * @returns {Promise<Answer>} A promise that resolves to the AI's response to the sprint.
 */
export async function prepare(sprint: string, ai: AI) {
	const task = buildPrompt(sprint);
	return sendRequest(task, ai);
}

/**
 * Creates a new sprint and saves it to a JSON file.
 * @param {string} goal - The goal of the sprint.
 * @param {AI} ai - The AI object representing the project manager.
 * @param cwd - The current working directory.
 * @returns {Promise<FileInfo>} A promise that resolves to an object containing the file path and
 *   content of the newly created sprint file.
 */
export async function create(goal: string, ai: AI, { cwd }: { cwd: string }) {
	console.log(`⏳ - Preparing Sprint for "${goal}"`);
	const task = await prepare(goal, ai);
	const json = parsers.json<Sprint>(task.answer);
	const filePath = path.join(cwd, getFilename(json.scope, "sprints", "json"));
	const content = addNewlineAtEnd(JSON.stringify(json, null, 2));
	await fs.writeFile(filePath, content);
	return { filePath, content };
}
