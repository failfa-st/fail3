import path from "node:path";

import boxen from "boxen";
import chalk from "chalk";

// For CLI usage
// import { cli } from "./cli.js";
import { projectsDirectory } from "./constants.js";
import { initializeProject } from "./github/create-repo.js";
// For Prompt usage
import { prompt } from "./prompt.js";
import { doSprint } from "./sprint/index.js";
import { PROJECT_MANAGER, QA_ENGINEER } from "./sprint/team.js";
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
		console.log(
			boxen(
				dedent`
					Creating project

					Project Name: ${chalk.yellow(projectName)}
				`.trim(),
				{
					title: projectName,
					padding: 1,
					titleAlignment: "center",
					borderColor: "yellow",
					width: 50,
				}
			)
		);
		await initializeProject(projectName);
	}
} else if (sprintScope ?? sprint) {
	console.log(
		boxen(
			dedent`
				Creating sprint.

				Sprint Scope: ${chalk.yellow(sprintScope)}
			`.trim(),
			{
				title: projectName,
				padding: 1,
				titleAlignment: "center",
				borderColor: "yellow",
				width: 50,
			}
		)
	);

	// Get the project directory and start the sprint
	await doSprint(
		{ sprintScope, sprint },
		{ PROJECT_MANAGER, QA_ENGINEER },
		{ cwd: projectDirectory, repo: projectName }
	);
}
