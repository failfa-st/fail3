import boxen from "boxen";
import chalk from "chalk";
import { config } from "dotenv";
import meow from "meow";

/**
 * Loads environment variables from a .env file and configures command-line interface options.
 * This function should be called before any local imports to ensure that process variables are
 * loaded correctly.
 */
config();

const {
	flags,
	input: [projectName],
} = meow(
	`
${chalk.yellow("Usage")}
  $ npm run project -- ${chalk.green("<project-name>")} [options]

${chalk.yellow("Options")}
  --init              Initialize a new project with the specified name
  --dry-run           Logs the flags and project info
  --sprint-scope, -s  Set the scope of a sprint and create it with the given name

${chalk.yellow("Examples")}
  $ npm run project -- my-project --init
  $ npm run project -- my-project --dry-run
  $ npm run project -- my-project --sprint-scope "Cookie banner, legal pages, GDPR"
`,
	{
		importMeta: import.meta,
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

if (flags.dryRun) {
	console.log(
		boxen(
			`
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
	console.log(
		boxen(
			`
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
	//
	// await initializeProject(projectName);
} else if (flags.sprintScope) {
	console.log(
		boxen(
			`
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
	//
	// const projectDirectory = path.join(projectsDirectory, projectName);
	// await doSprint(
	// 	flags.sprintScope,
	// 	{ PROJECT_MANAGER, QA_ENGINEER },
	// 	{ cwd: projectDirectory, repo: projectName }
	// );
}
