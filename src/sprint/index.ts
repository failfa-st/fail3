import slugify from "@sindresorhus/slugify";
import type { AxiosError } from "axios";
import { execa } from "execa";

import AI from "../ai/index.js";
import type { Role } from "../ai/types.js";
import { createIssue } from "../github/issues.js";
import { createPullRequest } from "../github/pull-requests.js";
import parsers from "../parsers/index.js";

import type { ErrorData, Sprint, SprintData, UserStory } from "./types.js";
import {
	createCypressTest,
	createFeature,
	createOpenAPIDocument,
	createSprint,
	getSchedule,
	handleError,
	wait,
} from "./utils.js";

/**
 * The AI instance representing a project manager role.
 */
export const PROJECT_MANAGER = new AI({ role: "PROJECT_MANAGER" });

/**
 * The AI instance representing a QA engineer role.
 */
export const QA_ENGINEER = new AI({ role: "QA_ENGINEER" });

export const SOFTWARE_ARCHITECT = new AI({ role: "SOFTWARE_ARCHITECT" });

/**
 * Creates GitHub issues for each user story in the given repository.
 * @param {UserStory[]} userStories - The array of user stories to create issues for.
 * @param {string} repo - The name of the repository to create issues in.
 * @returns {Promise<void[]>} An array of promises that resolve to the created issues.
 */
async function createIssues(userStories: UserStory[], repo: string) {
	return Promise.all(
		userStories.map(async ({ story, complexity, feature, acceptanceCriteria }) => {
			await createIssue(
				feature,
				`# Feature: ${feature}

## User Story

${story.split(",").join(",  \n")}

## Acceptance Criteria

${acceptanceCriteria.map(point => `- [ ] ${point}`).join(",  \n")}

## Info
**complexity: ${complexity}**
`,
				repo
			);
		})
	);
}

/**
 * Runs a sprint by creating a sprint, creating features for each user story, and creating Cypress
 * tests for each feature. Delays the creation of each feature and test based on a schedule to
 * prevent 429 Errors.
 *
 * @param {string} goal - The goal of the sprint.
 * @param {Partial<Record<Role, AI>>} - An object containing instances of AI for the project manager
 *   and QA engineer. The `PROJECT_MANAGER` instance of the AI is used to create a sprint and add
 *   user stories. The `QA_ENGINEER` instance of the AI is used to create features and Cypress
 *   tests.
 * @param {Object} options - An object containing the current working directory and the name of
 *   the GitHub repository where the issues will be created.
 * @param {string} options.cwd - The current working directory.
 * @param {string} options.repo - The name of the GitHub repository where the issues will be created.
 *
 * @returns {Promise<SprintData>} - A promise that resolves when all the Cypress tests are created.
 *
 * @throws - An error is thrown if there is an error during a sprint.
 */
export async function doSprint(
	goal: string,
	{ PROJECT_MANAGER, QA_ENGINEER, SOFTWARE_ARCHITECT }: Partial<Record<Role, AI>>,
	{ cwd, repo }: { cwd: string; repo: string }
): Promise<SprintData> {
	try {
		// Create a new sprint based on the goal.
		const sprint = await createSprint(goal, PROJECT_MANAGER, { cwd });
		console.log(`✅ - Created Sprint for "${goal}"`);
		const parsedSprint = parsers.json<Sprint>(sprint.content);
		const { userStories } = parsedSprint;

		// Create issues on GitHub
		// await createIssues(userStories, repo);

		// Delay creation of each feature and Cypress test based on a schedule to prevent 429
		// Errors.
		const schedule = getSchedule(userStories.length);
		const documents = await Promise.all(
			parsedSprint.userStories.map(async (userStory, index) => {
				const timestamp = schedule[index];
				await wait(timestamp);
				const fileInfo = await createOpenAPIDocument(userStory, SOFTWARE_ARCHITECT, {
					cwd,
				});
				return fileInfo;
			})
		);

		const filteredDocuments = documents.filter(document => Boolean(document.content));
		console.log(documents.length, filteredDocuments.length);

		console.log(`📦 - Created ${filteredDocuments.length} OpenAPI documents`);

		// Create issues on GitHub
		// await createIssues(userStories, repo);

		// Delay creation of each feature and Cypress test based on a schedule to prevent 429
		// Errors.
		// const schedule = getSchedule(userStories.length);
		// const features = await Promise.all(
		// 	parsedSprint.userStories.map(async (userStory, index) => {
		// 		const timestamp = schedule[index];
		// 		await wait(timestamp);
		// 		const feature = await createFeature(userStory, QA_ENGINEER, { cwd });
		// 		console.log(`✅ - Created Cucumber Feature for "${userStory.feature}"`);
		// 		await wait(timestamp + 2_000);
		// 		const test = await createCypressTest(feature, QA_ENGINEER, { cwd });
		// 		console.log(`✅ - Created Cypress Test for "${userStory.feature}"`);
		// 		return { feature, test };
		// 	})
		// );

		// console.log(`📦 - Created ${features.length} BDD features`);
		// console.log(`✅ - Completed Sprint for "${goal}"`);

		// // Create a branch and push the changes to the remote repository.
		const sprintName = slugify(parsedSprint.scope);
		const branchName = `test/${sprintName}`;
		//
		// await execa("git", ["switch", "-c", branchName], { stdio: "inherit", cwd });
		// await execa("git", ["add", "."], { stdio: "inherit", cwd });
		// await execa("git", ["commit", "-m", "test: prepare sprint"], { stdio: "inherit", cwd });
		// await execa("git", ["push", "-u", "origin", branchName], { stdio: "inherit", cwd });

		// Create a pull request for the changes in the remote repository.
		// await createPullRequest(branchName, repo);

		return { sprint: parsedSprint, features: [], sprintName, branchName };
	} catch (error: unknown) {
		// Handle any errors thrown during a sprint.
		handleError(error as AxiosError<ErrorData>);
	}
}
