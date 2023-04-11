import path from "node:path";

import boxen from "boxen";
import chalk from "chalk";
import { config } from "dotenv";
import meow from "meow";

import { projectsDirectory } from "./constants.js";
import { initializeProject } from "./github/create-repo.js";
import { doSprint, PROJECT_MANAGER, QA_ENGINEER } from "./sprint/index.js";
import { exists } from "./utils/fs.js";
import { dedent } from "./utils/string.js";

/**
 * Loads environment variables from a .env file and configures command-line interface options.
 * This function should be called before any local imports to ensure that process variables are
 * loaded correctly.
 */
config();

/**
 * Parses command line arguments to get the project name and any options passed in.
 * Defines the available options, their types, and their defaults.
 * Prints usage information, and throws an error if the project name is not provided.
 */
const {
	flags,
	input: [projectName], // Get the project name from the command-line arguments
} = meow(
	`
${chalk.yellow("Usage")}
  $ ./fail3.js ${chalk.green("<project-name>")} [options]

${chalk.yellow("Options")}
  --init              Initialize a new project with the specified name
  --dry-run           Logs the flags and project info
  --sprint-scope, -s  Set the scope of a sprint and create it with the given name

${chalk.yellow("Examples")}
  $ ./fail3.js my-project --init
  $ ./fail3.js my-project --dry-run
  $ ./fail3.js my-project --sprint-scope "Cookie banner, legal pages, GDPR"
`,
	{
		importMeta: import.meta, // Passes import.meta to meow for better error messages
		flags: {
			init: {
				type: "boolean",
				default: false,
			},
			dryRun: {
				type: "boolean",
				default: false,
			},
			sprintScope: {
				type: "string",
				alias: "s",
			},
		},
	}
);

// Check if dry run is enabled, if so, print the flags and project info
if (flags.dryRun) {
	console.log(
		boxen(
			dedent`
				Only logging flags and project name.
				No further actions will be taken.

				Project Name: ${chalk.yellow(projectName)}

				Flags: ${JSON.stringify(flags, null, 2)}
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
} else if (flags.init) {
	// Initialize a new project with the specified name
	const projectDirectory = path.join(projectsDirectory, projectName);

	// Do not proceed if the project has already been initialized
	const projectDirectoryExists = await exists(projectDirectory);
	if (projectDirectoryExists) {
		console.log(chalk.red(`Project ${projectName} already initialized`));
	} else {
		// Print information about creating the project and initialize it
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
} else if (flags.sprintScope) {
	console.log(
		boxen(
			dedent`
				Creating sprint.

				Sprint Scope: ${chalk.yellow(flags.sprintScope)}
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
	const projectDirectory = path.join(projectsDirectory, projectName);
	await doSprint(
		flags.sprintScope,
		{ PROJECT_MANAGER, QA_ENGINEER },
		{ cwd: projectDirectory, repo: projectName }
	);
}
