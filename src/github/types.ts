/**
 * Represents project data including the project name, project directory, Git repository name, and
 * Git repository URL.
 */
export interface ProjectData {
	/**
	 * The name of the project.
	 */
	projectName: string;

	/**
	 * The directory path of the project.
	 */
	projectDirectory: string;

	/**
	 * The name of the Git repository.
	 */
	repo: string;

	/**
	 * The URL of the Git repository.
	 */
	gitRepo: string;
}
