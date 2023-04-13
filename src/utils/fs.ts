import fs from "node:fs/promises";
import path from "node:path";

export async function exists(pathLike: string) {
	return fs
		.access(pathLike)
		.then(() => true)
		.catch(() => false);
}

export async function writeFile(filePath: string, content: string) {
	const { dir } = path.parse(filePath);
	const folderExists = await exists(dir);
	if (!folderExists) {
		await fs.mkdir(dir, { recursive: true });
	}

	await fs.writeFile(filePath, content);
}
