import type AI from "./index.js";

/**
 * Sends a request to the AI system and returns a promise that resolves to the AI's response.
 *
 * @param {string} task - The task to be processed by the AI.
 * @param {AI} ai - The AI object to be used for processing the task.
 * @returns {Promise<Answer>} A promise that resolves to the AI's response to the task.
 */
export async function sendRequest(task: string, ai: AI) {
	ai.task = task;
	return ai.answer;
}
