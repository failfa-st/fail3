/**
 * Removes common indentation from a template literal string.
 * It takes a `TemplateStringsArray` and any number of additional arguments.
 * It concatenates the strings with their corresponding arguments and then removes
 * the common leading whitespace from each line. The first line is not affected.
 *
 * @param {TemplateStringsArray} strings - The template literal strings to dedent.
 * @param {Array.<string | boolean | number>} args - The additional arguments passed to the template
 *   literal.
 * @returns {string} - The dedented string.
 */
export function dedent(strings: TemplateStringsArray, ...args: (string | boolean | number)[]) {
	return strings
		.flatMap((string, index) => [string, args[index] ?? ""])
		.join("")
		.replace(/^[\t\r]+/gm, "");
}

/**
 * Adds a newline character at the end of a string.
 * @param {string} text - The string to add a newline character to the end.
 * @returns {string} The string with a newline character added to the end.
 */
export function addNewlineAtEnd(text: string) {
	return `${text.trim()}\n`;
}
