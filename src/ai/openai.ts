import process from "node:process";

import { Configuration, OpenAIApi } from "openai";

/**
 * Configures the OpenAI package with the API key stored in the environment variable OPENAI_API_KEY.
 */
export const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Creates a new OpenAIApi object using the previously configured Configuration object.
 */
export const openai = new OpenAIApi(configuration);
