import process from "node:process";

import { octokit } from "./octokit.js";

/**
 * Creates a new pull request from the "main" branch to the specified base branch in the
 * specified repository.
 *
 * @param {string} base - The name of the branch where the changes are intended to be merged.
 * @param {string} repo - The name of the repository where the pull request will be created.
 *
 * @returns {Promise<void>} - A promise that resolves when the pull request is successfully created.
 *
 * @throws {Error} - An error is thrown if the pull request cannot be created.
 */
export async function createPullRequest(base: string, repo: string) {
	await octokit.rest.pulls.create({
		owner: process.env.GITHUB_OWNER,
		repo,
		head: "main",
		base,
	});
}
