/**
 * Trims whitespace from both ends of the input string.
 * @param {string} input - The string to trim.
 * @returns {string} The trimmed string.
 */
export function trim(input: string) {
	return input.trim();
}

/**
 * Removes leading spaces from the input string.
 * @param {string} input - The string to process.
 * @param {string} [replacer=""] - Optional string to replace the newlines. Defaults to a single space.
 * @returns The processed string with leading spaces removed.
 */
export function removeLeadingSpaces(input: string, replacer = "") {
	return input.replace(/^[ \t]+/gm, replacer);
}

/**
 * Removes newlines from the input string.
 * @param {string} input - The string to process.
 * @param {string} [replacer=" "] - Optional string to replace the newlines. Defaults to a single space.
 * @returns {string} The processed string with newlines removed.
 */
export function removeNewlines(input: string, replacer = " ") {
	return input.replace(/^\n+/, "").replace(/\n+$/, "").replace(/\n+/gm, replacer);
}

/**
 * Checks if the given error is an instance of SyntaxError.
 * @param {unknown} error - The error to check.
 * @returns {boolean} True if the error is an instance of SyntaxError, otherwise false.
 */
export function isSyntaxError(error: unknown): error is SyntaxError {
	return error instanceof SyntaxError;
}

/**
 * Interface describing the extracted content and language of a Markdown code block.
 */
export interface ExtractedCodeBlock {
	language?: string;
	content: string;
}

/**
 * Extracts the content and language of a Markdown code block from a given string.
 * @param {string} mdString - The Markdown string containing the code block.
 * @returns {ExtractedCodeBlock} An object with the language and content of the code block, or null if no code block is found.
 */
export function extractMarkdownCodeBlock(mdString: string): ExtractedCodeBlock {
	// The regular expression pattern to match the code block
	const codeBlockPattern = /(`{3,})(\w*)\n([\s\S]*?)\1/g;

	// Find the matches using the regular expression
	const matches = codeBlockPattern.exec(mdString);

	if (matches && matches.length >= 4) {
		const language = matches[2] || undefined;
		const content = matches[3];

		// Return the language (if available) and the content of the code block
		return { language, content };
	}

	// No code block found, return the original string
	return { content: mdString };
}

/**
 * Handles SyntaxError instances during JSON parsing.
 * @param input - The input string.
 * @param syntaxError - The SyntaxError instance.
 * @returns The parsed JSON object.
 * @throws The original SyntaxError if the error cannot be handled.
 */
function handleSyntaxError(input: string, syntaxError: SyntaxError) {
	try {
		return JSON.parse(extractMarkdownCodeBlock(input).content);
	} catch {
		throw syntaxError;
	}
}

/**
 * Parses a JSON string or extracts a JSON object from a Markdown code block.
 * @param input - The input string containing JSON or a Markdown code block.
 * @returns {JSON} The parsed JSON object.
 * @throws An error if the input cannot be parsed or is not valid.
 */
export function json<T = unknown>(input: string): T {
	const trimmedInput = trim(input);
	try {
		return JSON.parse(trimmedInput);
	} catch (error) {
		if (isSyntaxError(error)) {
			return handleSyntaxError(trimmedInput, error);
		}

		throw error;
	}
}

const parsers = {
	json,
};
export default parsers;
