/**
 * An object that represents a user story.
 */
export interface UserStory {
	/**
	 * The user story in the format "As a User, I want …, so that …".
	 */
	story: string;

	/**
	 * The complexity rating of the user story.
	 */
	complexity: number;

	/**
	 * The feature associated with the user story.
	 */
	feature: string;

	/**
	 * An array of acceptance criteria for the user story.
	 */
	acceptanceCriteria: string[];
}

/**
 * An object that represents a sprint.
 */
export interface Sprint {
	/**
	 * The scope or goal of the sprint.
	 */
	scope: string;

	/**
	 * The overall complexity rating of the sprint.
	 */
	complexity: number;

	/**
	 * An array of user stories associated with the sprint.
	 */
	userStories: UserStory[];
}

/**
 * A string literal type that represents the file type.
 */
export type FileType = "json" | "md" | "feature" | "ts";

/**
 * Represents the information about a file including the file path and content.
 */
export interface FileInfo {
	/**
	 * The file path of the file.
	 */
	filePath: string;

	/**
	 * The content of the file.
	 */
	content: string;
}

/**
 * Represents the error data returned by a failed API request.
 */
export interface ErrorData {
	/**
	 * The error message for the failed request.
	 */
	error: Error;
	message?: string;
}

/**
 * Represents the data for a sprint including the sprint details, features and tests and the names
 * of the sprint and branch.
 */
export interface SprintData {
	/**
	 * The details of the sprint.
	 */
	sprint: Sprint;
	/**
	 * The features and tests created for the sprint.
	 */
	features: { feature: FileInfo; test: FileInfo }[];
	/**
	 * The name of the sprint.
	 */
	sprintName: string;
	/**
	 * The name of the branch created for the sprint.
	 */
	branchName: string;
}
