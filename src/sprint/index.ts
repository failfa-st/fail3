import fs from "node:fs/promises";
import path from "node:path";

import slugify from "@sindresorhus/slugify";
import type { AxiosError } from "axios";
import { execa } from "execa";

import AI from "../ai/index.js";
import type { Role } from "../ai/types.js";
import { createPullRequest } from "../github/pull-requests.js";
import parsers from "../parsers/index.js";
import type { OpenApiDocument } from "../parsers/open-api-document.js";
import { parseOpenApiDocument } from "../parsers/open-api-document.js";
import { getSchedule, wait } from "../utils/timing.js";

import type { PageData } from "./jobs/components.js";
import { create as createComponents } from "./jobs/components.js";
import { create as createCucmberFeature } from "./jobs/cucumber-feature.js";
import { create as createCypressTest } from "./jobs/cypess-test.js";
import { create as createOpenAPIDocument } from "./jobs/open-api-document.js";
import { create as createServerlessFunction } from "./jobs/serverless-function.js";
import { create as createSprint } from "./jobs/sprint.js";
import type { ErrorData, Sprint, SprintData, UserStory } from "./types.js";
import { createIssues, handleError } from "./utils.js";

/**
 * Runs a sprint by creating a sprint, creating features for each user story, and creating Cypress
 * tests for each feature. Delays the creation of each feature and test based on a schedule to
 * prevent 429 Errors.
 *
 * @param {string} goal - The goal of the sprint.
 * @param {string} goal.sprint - existing sprint.
 * @param {string?} [goal.sprintScope] - The goal of the sprint.
 * @param {Partial<Record<Role, AI>>} - An object containing instances of AI for the project manager
 *   and QA engineer. The `PROJECT_MANAGER` instance of the AI is used to create a sprint and add
 *   user stories. The `QA_ENGINEER` instance of the AI is used to create features and Cypress
 *   tests.
 * @param {string} options.cwd - The current working directory.
 * @param {string} options.repo - The name of the GitHub repository where the issues will be created.
 *
 * @returns {Promise<SprintData>} - A promise that resolves when all the Cypress tests are created.
 *
 * @throws - An error is thrown if there is an error during a sprint.
 */
export async function doSprint(
	{ sprint: existingSprint, sprintScope }: { sprint?: string; sprintScope?: string },
	{ cwd, repo }: { cwd: string; repo: string }
): Promise<SprintData> {
	try {
		// Create a new sprint based on the goal.
		let parsedSprint: Sprint;
		let userStories: UserStory[];
		if (sprintScope) {
			/**
			 * The AI instance representing a project manager role.
			 */
			const PROJECT_MANAGER = new AI({ role: "PROJECT_MANAGER" });
			const sprint = await createSprint(sprintScope, PROJECT_MANAGER, { cwd });
			console.log(`✅ - Created Sprint for "${sprintScope}"`);
			parsedSprint = parsers.json<Sprint>(sprint.content);
			userStories = parsedSprint.userStories;
		} else {
			const content = await fs.readFile(path.join(cwd, "sprints", existingSprint), "utf-8");
			parsedSprint = parsers.json<Sprint>(content);
			userStories = parsedSprint.userStories;
		}

		const sprintName = slugify(parsedSprint.scope);
		const branchName = `test/${sprintName}`;

		// Create issues on GitHub
		// await createIssues(userStories, repo);

		// Delay creation of each feature and Cypress test based on a schedule to prevent 429
		// Errors.
		const schedule = getSchedule(userStories.length);

		const documents = await Promise.all(
			parsedSprint.userStories.map(async (userStory, index) => {
				const SOFTWARE_ARCHITECT = new AI({ role: "SOFTWARE_ARCHITECT" });

				const timestamp = schedule[index];
				await wait(timestamp);
				const fileInfo = await createOpenAPIDocument(userStory, SOFTWARE_ARCHITECT, {
					cwd,
				});
				return fileInfo;
			})
		);

		const filteredDocuments = documents.filter(document => Boolean(document.content));
		console.log(`📦 - Created ${filteredDocuments.length} OpenAPI documents`);

		const serverlessFunctionSchedule = getSchedule(filteredDocuments.length);
		const serverlessFunctions = await Promise.all(
			filteredDocuments.map(async (document, index) => {
				const timestamp = serverlessFunctionSchedule[index];
				await wait(timestamp);

				const endpoints = parseOpenApiDocument(
					parsers.json<OpenApiDocument>(document.content)
				);
				return Promise.all(
					endpoints.map(async endpoint => {
						const BACKEND_DEVELOPER = new AI({ role: "BACKEND_DEVELOPER" });

						return createServerlessFunction(
							{
								content: JSON.stringify(endpoint),
								filePath: endpoint.path.replace(/^\//, ""),
							},
							BACKEND_DEVELOPER,
							{ cwd }
						);
					})
				);
			})
		);

		console.log(`📦 - Created ${serverlessFunctions.length} Nextjs serverless functions`);

		// We iterate over the userStories, we assume that for each story there is 1 document
		// the OpenAPI Document might be null
		// we need both the story and the openAPI document
		const componentsSchedule = getSchedule(userStories.length, 1_000);
		const components = await Promise.all(
			userStories.map(async (story, index) => {
				const timestamp = componentsSchedule[index];
				await wait(timestamp);

				const document = documents[index];

				const endpoints =
					document.content === ""
						? [null]
						: parseOpenApiDocument(parsers.json<OpenApiDocument>(document.content));

				return Promise.all(
					endpoints.map(async endpoint => {
						const FRONTEND_DEVELOPER = new AI({ role: "FRONTEND_DEVELOPER" });

						const pageData: PageData = {
							// TODO: We have to think about the name here
							// as the cart could be anything
							filePath: endpoint?.path.replace(/^\//, "") ?? slugify(story.feature),
							contentData: {
								story,
								dataModelFile: {
									content: endpoint ? JSON.stringify(endpoint) : "",
									filePath: "",
								},
							},
						};

						return createComponents(pageData, FRONTEND_DEVELOPER, { cwd });
					})
				);
			})
		);

		console.log(`📦 - Created ${components.length} components`);

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
