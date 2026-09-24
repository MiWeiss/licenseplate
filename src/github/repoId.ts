/**
 * Reads the repository owner and repository name from a github url path,
 * e.g. from "/miweiss/licenseplate/issues".
 *
 * @param path the path of the url, i.e., without query and hash (such as `?tab=readme-ov-file`)
 * @returns owner and repo (empty strings if not present in the path)
 */
export function repoIdFromPath(path: string): { owner: string, repo: string } {
    const [, owner = "", repo = ""] = path.split("/");
    return {owner, repo};
}
