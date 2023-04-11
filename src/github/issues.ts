import process from "node:process";

import { octokit } from "./octokit.js";

/**
 * Creates a new GitHub issue with the specified title, body, and repository.
 * @param {string} title - The title of the new issue.
 * @param {string} body - The body of the new issue.
 * @param {string} repo - The name of the GitHub repository to create the issue in.
 * @returns {Promise<void>} A promise that resolves when the issue is created.
 */
export async function createIssue(title: string, body: string, repo: string) {
	return octokit.rest.issues.create({
		owner: process.env.GITHUB_OWNER,
		repo,
		title,
		body,
	});
}

// Const { data } = await createIssue(nanoid(), "Just a test");
// console.log(data);
