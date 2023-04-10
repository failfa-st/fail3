import slugify from "@sindresorhus/slugify";
import { config } from "dotenv";
import { execa } from "execa";

config();

import { initializeProject } from "./github/create-repo.js";
import { doSprint, PROJECT_MANAGER, QA_ENGINEER } from "./sprint/index.js";

const { projectDirectory, repo } = await initializeProject(`fail-${Date.now()}`);

const { sprint } = await doSprint(
	"Add Welcome message to home",
	{ PROJECT_MANAGER, QA_ENGINEER },
	{ cwd: projectDirectory, repo }
);

const sprintName = slugify(sprint.scope);

await execa("git", ["add", "."], { cwd: projectDirectory });
await execa("git", ["switch", "-c", `test/${sprintName}`], { cwd: projectDirectory });
await execa("git", ["commit", "-m", "'test: prepare sprint'"], { cwd: projectDirectory });
await execa("git", ["push", "-u", "origin", `test/${sprintName}`], { cwd: projectDirectory });
