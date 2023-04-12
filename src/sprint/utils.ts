import type { AxiosError } from "axios";

import { createIssue } from "../github/issues.js";
import { dedent } from "../utils/string.js";

import type { ErrorData, UserStory } from "./types.js";

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
		console.error(status, data?.error?.message ?? data?.message ?? statusText);
	} else {
		console.error(error);
	}
}

/**
 * Creates GitHub issues for each user story in the given repository.
 * @param {UserStory[]} userStories - The array of user stories to create issues for.
 * @param {string} repo - The name of the repository to create issues in.
 * @returns {Promise<void[]>} An array of promises that resolve to the created issues.
 */
export async function createIssues(userStories: UserStory[], repo: string) {
	return Promise.all(
		userStories.map(async ({ story, complexity, feature, acceptanceCriteria }) => {
			await createIssue(
				feature,
				dedent`
				# Feature: ${feature}

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
