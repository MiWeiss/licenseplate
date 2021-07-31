import {checkIsIgnored} from "../utils/ignoreUtils"
import {cacheGithubRepos, getCachedKeyForGithubRepo} from "../utils/cacheUtils";
import {getGithubAuthToken} from "./authUtils";

/**
 * Mock license key to be used with repos which are not accessible
 */
export const FOUND_NO_REPO = "NO-REPO";

/**
 * Mock license key to be used with repos where a 403 was given.
 */
export const API_LIMIT_REACHED = "API_LIMIT_REACHED";

/**
 * Mock license key to be used with repos which don't have a license file
 */
export const FOUND_NO_LICENSE = "NO-LICENSE";

/**
 * License key for unknown licenses.
 * This value is directly taken from the github requests.
 */
export const FOUND_UNKNOWN_LICENSE = "other";

/**
 * Mock license key to be used for repositories which are configured
 * as 'ignored' by the extension user.
 */
export const FOUND_IGNORED_REPO = "licenseplate-ignored";

/**
 * For a given repository, resolves the license key.
 *
 * Besides actual license keys, may also return one of the following mock keys:
 *
 * {@link FOUND_IGNORED_REPO},
 *
 * {@link FOUND_NO_LICENSE},
 *
 * {@link FOUND_NO_REPO},
 *
 * {@link FOUND_UNKNOWN_LICENSE}.
 *
 * @remarks
 * This method makes multiple requests to local storage, and potentially a request
 * to the github API (if no entry cached)!
 *
 * @param owner The owner of the repository to be queried
 * @param repo The name of the repository to be queried
 * @returns a promise of a license key.
 */
export async function findLicense(owner: string, repo: string): Promise<string> {
    const ignored = checkIsIgnored("github", `${owner}/${repo}`);
    const cached = getCachedKeyForGithubRepo(owner, repo);
    const auth = getGithubAuthToken();
    if (await ignored) {
        return FOUND_IGNORED_REPO
    }
    const cachedKey = await cached;
    if (cachedKey) {
        console.log("[licenseplate] found key in cache");
        return cachedKey
    } else {
        // Note: We don't run this at the same time as checkIsIgnored
        // (even though both are async and take a bit),
        // to avoid needless requests to the github API
        const authToken = await auth;
        const key: string = await findKeyFromAPI(owner, repo, authToken);
        // Create task to cache this *after a delay*
        //      (to avoid congestion due to this low prio task
        //       on early page load)
        if (key !== API_LIMIT_REACHED){
            setTimeout(() => cacheGithubRepos({
                owner: owner,
                repo: repo,
                lKey: key
            }).then(() => console.log(`[licenseplate]: cached ${key} for ${owner}/${repo} `)), 500);
        }
        return key
    }
}

/**
 * Queries the github API to get the license key for a particular, single repo.
 *
 * @Remark
 * Never call this directly. Call {@link findLicense} instead, which will use caching and
 * owner / repository ignoring.
 *
 * @param owner The owner of the repository to be queried
 * @param repo The name of the repository to be queried
 * @param authToken Optional github authentication token
 */
async function findKeyFromAPI(owner: string, repo: string, authToken?: string): Promise<string> {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    let repoResponse: Response;
    if (authToken){
        repoResponse = await fetch(url, {
            headers: new Headers({
                'Authorization': 'token ' + authToken
            }),
        });
    }else{
        repoResponse = await fetch(url);
    }
    if (repoResponse.status === 404) {
        return FOUND_NO_REPO // Most likely a private repo
    }
    if (repoResponse.status === 403) {
        return API_LIMIT_REACHED // Most likely a private repo
    }
    if (!repoResponse.ok) {
        throw Error(`Get request to "${url}" failed with status code ${repoResponse.status}`)
    }
    let repoInfo = await repoResponse.json();
    if (!repoInfo.license) {
        return FOUND_NO_LICENSE
    }
    // Key is `other` if a license file was found, but license not recognized
    return repoInfo.license.key
}