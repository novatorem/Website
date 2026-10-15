// Subset of the GitHub REST API repository object used by the site
// https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user
export interface Repo {
	id: number;
	name: string;
	html_url: string;
	description: string | null;
	fork: boolean;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
}
