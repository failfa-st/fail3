import fs from "node:fs/promises";
import path from "node:path";

/**
 * Recursively copies a directory from a source path to a destination path.

 * @param {string} src - The source path of the directory to be copied.
 * @param {string} destination - The destination path of the directory to be copied to.
 */
export async function copyDir(src, destination) {
	await fs.mkdir(destination, { recursive: true });
	const entries = await fs.readdir(src, { withFileTypes: true });

	await Promise.all(
		entries.map(async entry => {
			const srcPath = path.join(src, entry.name);
			const destPath = path.join(destination, entry.name);

			return entry.isDirectory()
				? copyDir(srcPath, destPath)
				: fs.copyFile(srcPath, destPath);
		})
	);
}
