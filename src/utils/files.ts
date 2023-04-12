import slugify from "@sindresorhus/slugify";

import type { FileType } from "../sprint/types.js";

/**
 * Returns the filename for a file based on a name, directory, and file type.
 *
 * @param {string} name - The name to use in the filename.
 * @param {string} directory - The directory in which to place the file.
 * @param {FileType} type - The file type.
 * @returns {string} The filename.
 */
export function getFilename(name: string, directory: string, type: FileType) {
	return `${directory}/${slugify(name)}.${type}`;
}
