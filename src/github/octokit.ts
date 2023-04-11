import process from "node:process";

import { Octokit } from "@octokit/rest";

console.log("GITHUB_TOKEN:", process.env.GITHUB_TOKEN);

export const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN,
});
