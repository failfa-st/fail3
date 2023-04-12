import fs from "node:fs/promises";

import slugify from "@sindresorhus/slugify";
import inquirer from "inquirer";

import { projectsDirectory } from "./constants.js";
import { exists } from "./utils/fs.js";

// Create the projects directory if it doesn't exist
const projectsDirectoryExists = await exists(projectsDirectory);
if (!projectsDirectoryExists) {
	await fs.mkdir(projectsDirectory, { recursive: true });
}

// Read the project directories and store them in an array
const projects = (await fs.readdir(projectsDirectory, { withFileTypes: true }))
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name);

/**
 * The `prompt` function is responsible for prompting the user to select a project
 * or create a new one, as well as specify a sprint scope if applicable.
 *
 * @returns {Object} An object containing the project name, sprint scope, and initialization status.
 */
export async function prompt() {
	try {
		const rawAnswers = await inquirer.prompt([
			{
				type: "list",
				loop: false,
				name: "project",
				message: "Select Project",
				choices: ["New Project", new inquirer.Separator(), ...projects],
			},
			{
				type: "input",
				name: "projectName",
				message: "Project Name",
				when(answers) {
					return answers.project === "New Project";
				},
				default() {
					return `fail-${Date.now()}`;
				},
			},
			{
				type: "input",
				name: "sprintScope",
				message: "Sprint Scope",
				when(answers) {
					return answers.project !== "New Project";
				},
			},
		]);
		return {
			projectName:
				rawAnswers.project === "New Project"
					? slugify(rawAnswers.projectName)
					: rawAnswers.project,
			sprintScope: rawAnswers.sprintScope,
			init: !rawAnswers.sprintScope,
		};
	} catch (error) {
		if (error.isTtyError) {
			throw new Error("Environment not supported");
		} else {
			// Something else went wrong
			throw error;
		}
	}
}
