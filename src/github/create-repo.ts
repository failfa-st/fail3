import { existsSync } from "fs";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { config } from "dotenv";
import { execa } from "execa";
import ora from "ora";

import { octokit } from "./octokit.js";
import type { ProjectData } from "./types.js";
import { copyDir } from "./utils.js";

config();
const CWD = process.cwd();
const projectsDirectory = path.join(CWD, "../projects");

const templatesDirectory = path.join(CWD, "templates");

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
	const spinner = ora(`Creating Project ${projectName}`).start();

	// Define the project directory and git repository
	const projectDirectory = path.join(projectsDirectory, projectName);
	const gitRepo = `git@github.com:${process.env.GITHUB_OWNER}/${projectName}.git`;

	// Create the projects directory if it doesn't exist
	if (!existsSync(projectsDirectory)) {
		spinner.text = "Creating project directory";
		await fs.mkdir(projectsDirectory, { recursive: true });
	}
	// >>>> START Setup from template
	// await execa(
	// 	"npx",
	// 	["create-next-app", projectName, "--example", "https://github.com/pixelass/pwa-template"],
	// 	{
	// 		cwd: projectsDirectory,
	// 	}
	// );
	// await execa("yarn", ["install"], { cwd: projectsDirectory });
	// >>>> END Setup from template

	// >>>> START Manual setup
	// Initialize the project from the Next.js app template and install tech stack
	await execa("npx", ["create-next-app", projectName, "--typescript"], {
		cwd: projectsDirectory,
	});
	await execa("npm", ["install", ...techStack], { cwd: projectDirectory });

	// Copy the template directories to the project directory
	await copyDir(path.join(templatesDirectory, "cypress"), path.join(projectDirectory, "cypress"));
	await copyDir(path.join(templatesDirectory, "sprints"), path.join(projectDirectory, "sprints"));
	// >>>> END Manual setup

	// Create a new GitHub repository and link it to the project directory
	await octokit.rest.repos.createForAuthenticatedUser({
		name: projectName,
		private: true,
	});
	await execa("git", ["remote", "add", "origin", gitRepo], { cwd: projectDirectory });

	// Commit and push the project setup
	await execa("git", ["add", "."], { cwd: projectDirectory });
	await execa("git", ["branch", "-M", "main"], { cwd: projectDirectory });
	await execa("git", ["commit", "-m", "'chore: project setup'"], { cwd: projectDirectory });
	await execa("git", ["push", "-u", "origin", "main"], { cwd: projectDirectory });

	// Succeed the spinner and return the details of the new project
	spinner.succeed(`Created Project ${projectName}`);
	return { projectName, projectDirectory, repo: projectName, gitRepo };
}
