/**
 * Title of the request-a-license issue.
 */
const LICENSE_REQUEST_TITLE = "Add a License File";

/**
 * Markdown template to be used as the request-a-license issue description.
 */
const LICENSE_REQUEST_TEMPLATE =
    `It appears that this repository does not have a license, which may disallow anyone to use its content (read about this [here](https://choosealicense.com/no-permission/)). Thus, would you mind adding a 'LICENSE' file to your repository?

By the way: To choose a license, [choosealicense.com](https://choosealicense.com/) and [the opensource guide](https://opensource.guide/legal/#which-open-source-license-is-appropriate-for-my-project) are great places to start looking.
Adding the license to the repo can then easily be done using one of githubs template, as shown [here](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-license-to-a-repository).

Thanks in advance!

<sub>Issue created using the [licenseplate browser extension](https://github.com/MiWeiss/licenseplate), which relies on the GitHub API to identify licenses. This is not legal advice.</sub>`;

/**
 * Builds the url of a repository's 'create issue' page,
 * with title and description pre-filled with the request-a-license template.
 *
 * Relies on github's `title` and `body` query parameters for new issues,
 * which, unlike filling in the form, does not depend on github's page structure.
 *
 * @param owner The owner of the repository
 * @param repo The name of the repository
 */
export function licenseRequestIssueUrl(owner: string, repo: string): string {
    const params = new URLSearchParams({
        title: LICENSE_REQUEST_TITLE,
        body: LICENSE_REQUEST_TEMPLATE,
    });
    return `https://github.com/${owner}/${repo}/issues/new?${params}`;
}
