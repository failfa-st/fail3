import path from "node:path";

import chalk from "chalk";

// For CLI usage
// import { cli } from "./cli.js";
import { projectsDirectory } from "./constants.js";
import { initializeProject } from "./github/create-repo.js";
// For Prompt usage
import { prompt } from "./prompt.js";
import { doSprint } from "./sprint/index.js";
import { exists } from "./utils/fs.js";
import { dedent } from "./utils/string.js";

// CLI
// const { init, projectName, sprintScope } = cli();
// Prompt
const { init, projectName, sprint, sprintScope } = await prompt();

const projectDirectory = path.join(projectsDirectory, projectName);

if (init) {
	// Initialize a new project with the specified name
	// Do not proceed if the project has already been initialized
	const projectDirectoryExists = await exists(projectDirectory);
	if (projectDirectoryExists) {
		console.log(chalk.red(`Project ${projectName} already initialized`));
	} else {
		await initializeProject(projectName);
	}
} else if (sprintScope ?? sprint) {
	// Get the project directory and start the sprint
	await doSprint({ sprintScope, sprint }, { cwd: projectDirectory, repo: projectName });
}
