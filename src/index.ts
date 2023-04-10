import type { AxiosError } from "axios";

import AI from "./ai/index.js";
import type { Role } from "./ai/types.js";
import type { ErrorData, Sprint } from "./types.js";
import {
	createCypressTest,
	createFeature,
	createSprint,
	getSchedule,
	handleError,
	wait,
} from "./utils.js";

/**
 * The AI instance representing a project manager role.
 */
const PROJECT_MANAGER = new AI({ role: "PROJECT_MANAGER" });

/**
 * The AI instance representing a QA engineer role.
 */
const QA_ENGINEER = new AI({ role: "QA_ENGINEER" });

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
 *
 * @returns {Promise<void>} - A promise that resolves when all the Cypress tests are created.
 *
 * @throws - An error is thrown if there is an error during a sprint.
 */
async function doSprint(
	goal: string,
	{ PROJECT_MANAGER, QA_ENGINEER }: Partial<Record<Role, AI>>
): Promise<void> {
	try {
		// Create a new sprint based on the goal.
		const sprint = await createSprint(goal, PROJECT_MANAGER);
		console.log(`✅ - Created Sprint for "${goal}"`);
		const parsedStory: Sprint = JSON.parse(sprint.content);
		const { userStories } = parsedStory;

		// Delay creation of each feature and Cypress test based on a schedule to prevent 429
		// Errors.
		const schedule = getSchedule(userStories.length);
		const cypressTests = await Promise.all(
			parsedStory.userStories.map(async (userStory, index) => {
				const timestamp = schedule[index];
				await wait(timestamp);
				const feature = await createFeature(userStory, QA_ENGINEER);
				console.log(`✅ - Created Cucumber Feature for "${userStory.feature}"`);
				await wait(timestamp + 2_000);
				const test = await createCypressTest(feature, QA_ENGINEER);
				console.log(`✅ - Created Cypress Test for "${userStory.feature}"`);
				return test;
			})
		);

		// Log the number of created BDD features.
		console.log(`📦 - Created ${cypressTests.length} BDD features`);
		console.log(`✅ - Completed Sprint for "${goal}"`);
	} catch (error: unknown) {
		// Handle any errors thrown during a sprint.
		handleError(error as AxiosError<ErrorData>);
	}
}

// Test the sprint
// await doSprint("Add Cookie banner", { PROJECT_MANAGER, QA_ENGINEER });
