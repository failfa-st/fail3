import slugify from "@sindresorhus/slugify";
import chalk from "chalk";
import meow from "meow";

/**
 * The `cli` function is responsible for parsing command-line arguments,
 * defining available options, and handling user input.
 *
 * @returns {Object} An object containing the parsed project name and options.
 */
export function cli() {
	const {
		flags,
		input: [projectName], // Get the project name from the command-line arguments
	} = meow(
		`
			${chalk.yellow("Usage")}
			  ${chalk.magenta("❯")} ./fail3.js ${chalk.green("<project-name>")} [options]

			${chalk.yellow("Options")}
			  --init              Initialize a new project with the specified name
			  --sprint-scope, -s  Set the scope of a sprint and create it with the given name

			${chalk.yellow("Examples")}
			  ${chalk.magenta("❯")} ./fail3.js my-project --init
			  ${chalk.magenta("❯")} ./fail3.js my-project --sprint-scope "Cookie banner, legal pages, GDPR"
		`,
		{
			importMeta: import.meta, // Passes import.meta to meow for better error messages
			flags: {
				init: {
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

	return {
		init: flags.init,
		sprintScope: flags.sprintScope,
		projectName: slugify(projectName),
	};
}
