import process from "node:process";

import { Octokit } from "@octokit/rest";
import { config } from "dotenv";

config();

export const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN,
});
