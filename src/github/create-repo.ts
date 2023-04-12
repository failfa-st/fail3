import path from "node:path";
import process from "node:process";

import { execa } from "execa";
import ora from "ora";

import { projectsDirectory, templatesDirectory } from "../constants.js";

import { octokit } from "./octokit.js";
import type { ProjectData } from "./types.js";
import { copyDir } from "./utils.js";

const techStack = [
	"@mui/material",
	"@emotion/styled",
	"@emotion/react",
	"axios",
	"swr",
	"react-hook-form",
	"jotai",
	"nanoid",
	"next-auth",
	"zustand",
];

const devDependencies = [
	"@badeball/cypress-cucumber-preprocessor",
	"@cypress/webpack-preprocessor",
	"cypress",
];

/**
 * Initializes a new project by creating a project directory, setting up a new Next.js app,
 * installing a list of tech stack, adding cypress testing, and linking to a GitHub repository.
 *
 * @param {string} projectName - The name of the new project.
 * @returns {Promise<ProjectData>} An object
 *   containing the name of the project, its directory, and the GitHub repository URL.
 */
export async function initializeProject(projectName: string): Promise<ProjectData> {
	// Creates a new instance of the ora spinner to indicate progress

	// Define the project directory and git repository
	const projectDirectory = path.join(projectsDirectory, projectName);
	const gitRepo = `git@github.com:${process.env.GITHUB_OWNER}/${projectName}.git`;

	// >>>> START Setup from template
	// await execa(
	// 	"npx",
	// 	["create-next-app", projectName, "--example", "https://github.com/failfa-st/templates/next-mui"],
	// 	{
	// 		cwd: projectsDirectory,
	// 	}
	// );
	// await execa("yarn", ["install"], { cwd: projectsDirectory });
	// >>>> END Setup from template

	// >>>> START Manual setup
	// Initialize the project from the Next.js app template and install tech stack
	await execa(
		"npx",
		[
			"-y",
			"create-next-app@latest",
			projectName,
			"--typescript",
			"--eslint",
			"--use-npm",
			"--no-tailwind",
			"--src-dir",
			"--experimental-app",
			"false",
			"--import-alias",
			"@/*",
		],
		{
			stdio: "inherit",
			cwd: projectsDirectory,
		}
	);

	await execa("npm", ["install", "--save-exact", ...techStack], {
		stdio: "inherit",
		cwd: projectDirectory,
	});
	await execa("npm", ["install", "--save-dev", ...devDependencies], {
		stdio: "inherit",
		cwd: projectDirectory,
	});

	// Copy the template directories to the project directory
	await copyDir(path.join(templatesDirectory, "cypress"), path.join(projectDirectory, "cypress"));
	await copyDir(path.join(templatesDirectory, "sprints"), path.join(projectDirectory, "sprints"));
	// >>>> END Manual setup

	// Create a new GitHub repository and link it to the project directory
	await octokit.rest.repos.createForAuthenticatedUser({
		name: projectName,
		private: true,
	});
	await execa("git", ["remote", "add", "origin", gitRepo], {
		stdio: "inherit",
		cwd: projectDirectory,
	});

	// Commit and push the project setup
	await execa("git", ["add", "."], { stdio: "inherit", cwd: projectDirectory });
	await execa("git", ["branch", "-M", "main"], { stdio: "inherit", cwd: projectDirectory });
	await execa("git", ["commit", "-m", "'chore: project setup'"], {
		stdio: "inherit",
		cwd: projectDirectory,
	});
	await execa("git", ["push", "-u", "origin", "main"], {
		stdio: "inherit",
		cwd: projectDirectory,
	});

	// Return the details of the new project
	return { projectName, projectDirectory, repo: projectName, gitRepo };
}
