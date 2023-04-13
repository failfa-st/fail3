import { nanoid } from "nanoid";
import type { ChatCompletionRequestMessage } from "openai";

import { dedent } from "../utils/string.ts";

import { openai } from "./openai.js";
import type { AIConstructor, Model, Persona, Role, Temperature, Answer } from "./types.js";

export const models: Record<"smart" | "fast", Model> = {
	smart: "gpt-4",
	fast: "gpt-3.5-turbo",
};

const personas: Record<Role, Persona> = {
	FRONTEND_DEVELOPER: {
		name: "Frontend Developer",
		role: "FRONTEND_DEVELOPER",
		temperature: 0.2,
		historyLimit: 3,
		maxTokens: 3000,
		model: models.fast,
		system: dedent`You are a Frontend Developer.
		You fetch "DATA MODEL".
		You always do "YOUR TASK".
		You prefer TABS over spaces.
		You always strictly follow the "CODE GUIDE".
		You always strictly follow the "TEMPLATE".
		You exclusively answer with the desired "OUTPUT FORMAT".
		`,
	},
	BACKEND_DEVELOPER: {
		name: "Backend Developer",
		role: "BACKEND_DEVELOPER",
		temperature: 0.2,
		historyLimit: 3,
		maxTokens: 3000,
		model: models.fast,
		system: `You are a Backend Developer.
You implement "DATA MODEL".
You always do "YOUR TASK".
You always strictly follow the "CODE GUIDE".
You always strictly follow the "TEMPLATE".
You exclusively answer with the desired "OUTPUT FORMAT".
`,
	},
	PROJECT_MANAGER: {
		name: "Project Manager",
		role: "PROJECT_MANAGER",
		temperature: 0.5,
		historyLimit: 9,
		maxTokens: 6000,
		model: models.smart,
		system: `You are a "Project Manager".
You ensure that the "Project" is delivered in the best quality.
You make all decisions in the "Project".
You always do "YOUR TASK".
You always strictly follow "DATA TYPES".
You exclusively answer with the desired "OUTPUT FORMAT".
`,
	},
	SCRUM_MANAGER: {
		name: "Scrum Manager",
		role: "SCRUM_MANAGER",
		temperature: 0.5,
		historyLimit: 3,
		maxTokens: 6000,
		model: models.smart,
		system: ``,
	},
	SOFTWARE_ARCHITECT: {
		name: "Software Architect",
		role: "SOFTWARE_ARCHITECT",
		temperature: 0.2,
		historyLimit: 3,
		maxTokens: 6000,
		model: models.smart,
		system: `You are a "Software Architect".
You create "DATA MODEL" for REST API.
You always do "YOUR TASK".
You exclusively answer with the desired "OUTPUT FORMAT".
`,
	},
	QA_ENGINEER: {
		name: "QA Engineer",
		role: "QA_ENGINEER",
		temperature: 0.2,
		historyLimit: 3,
		maxTokens: 6000,
		model: models.smart,
		system: `You are a "QA Engineer".
You ensure that the "Project" is fully tested.
You always do "YOUR TASK".
You always strictly follow the "CODE GUIDE".
You always strictly follow the "TEMPLATE".
You exclusively answer with the desired "OUTPUT FORMAT".
`,
	},
	COPY_WRITER: {
		name: "Copy Writer",
		role: "COPY_WRITER",
		temperature: 0.8,
		historyLimit: 3,
		maxTokens: 6000,
		model: models.smart,
		system: ``,
	},
};

/**
 * Represents an AI object used to generate responses to user inputs.
 */
class AI {
	/**
	 * The unique identifier for the AI object.
	 */
	readonly id: string;

	/**
	 * The role that the AI represents.
	 */
	readonly role: Role;

	/**
	 * The version of the AI model being used.
	 */
	readonly model: Model;

	/**
	 * The temperature parameter used in text generation by the AI system.
	 */
	readonly temperature: Temperature;

	/**
	 * The number of previous responses to include in the context for generating new responses.
	 */
	readonly historyLimit: number;

	/**
	 * The maximum number of tokens to generate in the AI system's response.
	 */
	readonly maxTokens: number;

	/**
	 * An array of previous user inputs and AI responses used to generate new responses.
	 */
	readonly history: ChatCompletionRequestMessage[];

	/**
	 * The task that is currently assigned to the AI.
	 */
	#task: string;

	/**
	 * The instruction system being used to guide the behavior of the AI system.
	 */
	#system: string;

	/**
	 * Creates a new AI object with the specified role.
	 *
	 * @param {AIConstructor} options - The configuration options for the AI object.
	 */
	constructor({ role }: AIConstructor) {
		this.id = nanoid();
		this.role = role;
		this.model = personas[role].model;
		this.maxTokens = personas[role].maxTokens;
		this.temperature = personas[role].temperature;
		this.historyLimit = personas[role].historyLimit;
		this.history = [];
		this.#system = personas[role].system;
	}

	/**
	 * Returns a new AI response based on the current state of the AI object and the user's input
	 * history.
	 *
	 * @returns {Promise<Answer>} A promise that resolves to an object containing the AI's response.
	 */
	get answer(): Promise<Answer> {
		return (async () => {
			const completion = await openai.createChatCompletion({
				model: this.model,
				messages: [
					{
						role: "system",
						content: this.#system,
					},
					...this.history,
				],
				// eslint-disable-next-line camelcase
				max_tokens: this.maxTokens,
				temperature: this.temperature,
			});
			return {
				id: this.id,
				model: this.model,
				role: this.role,
				answer: completion.data.choices[0].message.content,
			};
		})();
	}

	/**
	 * Returns the current task assigned to the AI.
	 *
	 * @returns {string} The current task assigned to the AI.
	 */
	get task() {
		return this.#task;
	}

	/**
	 * Assigns a new task to the AI and adds the user's input to the AI object's history. Any excess
	 * input entries based on the history limit are removed.
	 *
	 * @param {string} content - The new task assigned to the AI.
	 */
	set task(content: string) {
		this.#task = content;

		// Add the user's input to the AI's history.
		this.history.push({
			role: "user",
			content,
		});

		// Remove any excess input entries from the AI's history based on the history limit.
		while (this.history.length > this.historyLimit) {
			this.history.shift();
		}
	}

	/**
	 * Returns the current instruction system of the AI.
	 *
	 * @returns {string} The current instruction system of the AI.
	 */
	get system() {
		return this.#system;
	}

	/**
	 * Sets the current instruction system of the AI.
	 *
	 * @param {string} system - The new instruction system to set for the AI.
	 */
	set system(system: string) {
		this.#system = system;
	}
}

export default AI;
