#!/usr/bin/env node

/**
 * It first imports necessary modules such as `node:path`, `node:process`, and `node:url`.
 * It then uses `url.fileURLToPath` to convert the `import.meta.url` to a path to the current
 * directory.
 * It then joins this directory path with `src/index.ts` to obtain the full path to the TypeScript
 * file.
 *
 * Finally, it uses the `execa` library to execute `npx ts-node-esm src/index.ts ...args` command
 * with the current directory as working directory.
 * It passes any output produced by the TypeScript file to the standard output stream.
 *
 * @requires path
 * @requires process
 * @requires url
 * @requires execa
 */
import path from "node:path";
import process from "node:process";
import * as url from "node:url";

import { config } from "dotenv";
import { execa } from "execa";

/**
 * Loads environment variables from a .env file and configures command-line interface options.
 * This function should be called before any local imports to ensure that process variables are
 * loaded correctly.
 */
config();

// Use `url.fileURLToPath` to convert the `import.meta.url` to a path to the current directory
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

// Join the directory path with entry to obtain the full path to the TypeScript file
const entry = path.join(__dirname, "src/dev.ts");

// Extract any additional command-line arguments and pass them to the TypeScript file
const argv = process.argv.splice(2);

// Pass any output produced by the TypeScript file to the standard output stream
await execa("npx", ["ts-node-esm", entry, ...argv], {
	stdio: "inherit",
	cwd: __dirname,
});
