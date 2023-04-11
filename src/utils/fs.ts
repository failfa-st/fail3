import fs from "node:fs/promises";

export async function exists(pathLike: string) {
	return fs
		.access(pathLike)
		.then(() => true)
		.catch(() => false);
}
