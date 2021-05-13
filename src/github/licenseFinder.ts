import {checkIsIgnored} from "../utils/ignoreUtils"
import {cacheGithubRepos, getCachedKeyForGithubRepo} from "../utils/cacheUtils";

export const FOUND_NO_REPO = "NO-REPO";
export const FOUND_NO_LICENSE = "NO-LICENSE";
export const FOUND_UNKNOWN_LICENSE = "other"; // Value from github api
export const FOUND_IGNORED_REPO = "licenseplate-ignored";

export async function findLicense(owner: string, repo: string): Promise<any> {
    const ignored = checkIsIgnored("github", `${owner}/${repo}`);
    const cached = getCachedKeyForGithubRepo(owner, repo);
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
        let key: string = await findKey(owner, repo);
        // Create task to cache this in 2'
        //      (to avoid congestion due to this low prio task
        //       on early page load)
        setTimeout(() => cacheGithubRepos({
            owner: owner,
            repo: repo,
            lKey: key
        }).then(() => console.log(`[licenseplate]: cached ${key} for ${owner}/${repo} `)), 2);
        return key
        // return await getLicenseProperties(key)
    }

}

async function findKey(owner: string, repo: string): Promise<string> {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    let repoResponse: Response = await fetch(url);
    if (repoResponse.status === 404) {
        return FOUND_NO_REPO // Most likely a private repo
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

//
// async function getLicenseProperties(key: string): Promise<any> {
//     if (key === FOUND_NO_REPO || key === FOUND_NO_LICENSE || key === FOUND_UNKNOWN_LICENSE){
//         return key
//     }
//     // TODO Caching
//     const url = `https://api.github.com/licenses/${key}`;
//     let licenseResponse: Response = await fetch(url);
//     if (!licenseResponse.ok){
//         throw Error(`Get request to "${url}" failed with status code ${licenseResponse.status}`)
//     }
//     return await licenseResponse.json()
// }


// Example of repo without license: "https://github.com/noameshed/first-android-app"
// Example of repo with special license: https://github.com/mahmoud/boltons