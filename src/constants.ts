import path from "node:path";
import process from "node:process";

export const CWD = process.cwd();
export const projectsDirectory = path.join(CWD, "../projects");
export const templatesDirectory = path.join(CWD, "templates");
