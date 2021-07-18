interface CacheEntry {
    owner: string
    repo: string
    lKey: string
    expires: number
}


interface ToCache {
    owner: string
    repo: string
    lKey: string
}

/**
 * Loads the cache from local storage.
 *
 * Typically, you don't want to use this directly. Instead, you may want
 * to use any of the utility methods provided in this file, such as
 * {@link getCachedKeyForGithubRepo}
 */
export const getCacheFromStorage = async function (): Promise<Array<CacheEntry>> {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get("gh-repo-cache", function (value) {
                const result = value["gh-repo-cache"];
                if (Array.isArray(result)) {
                    resolve(result);
                } else {
                    resolve([]);
                }
            });
        } catch (ex) {
            reject(ex);
        }
    });
};

/**
 * Creates or replaces the cache with the provided array of CacheEntries
 * @param cacheEntries the new cache
 */
export const upsertCache = async function (cacheEntries: Array<CacheEntry>) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({"gh-repo-cache": cacheEntries}, function () {
                resolve(null);
            });
        } catch (ex) {
            reject(ex);
        }
    });
};

/**
 * Checks if a Cached Entry is still valid, i.e., if it's expiry timestamp is still in the future.
 * @param ce the entry to check
 */
export const isStillValid = (ce: CacheEntry) => ce.expires > Date.now();

function repoMatcher(owner: string, repo: string) {
    return (ce: CacheEntry) => ce.repo === repo && ce.owner === owner
}

/**
 * Finds a license key for a specified repository in the cache.
 * @param owner identifying the owner of the repository to remove
 * @param repo identifying the repository to remove
 * @returns If the license key is found, it is provided by the returned promise. Otherwise,
 * the retuned promise evaluates to `null`.
 */
export async function getCachedKeyForGithubRepo(owner: string, repo: string): Promise<string | null> {
    const cache = await getCacheFromStorage();
    const filtered = cache
        .filter(repoMatcher(owner, repo))
        .filter(isStillValid);
    if (filtered.length > 0) {
        return filtered[0].lKey;
    } else {
        return null
    }
}

/**
 * Returns the expiry-timestamp for a cache item created now.
 */
function expire(): number {
    // Cache expires after one hour
    return Date.now() + (1000 * 60 * 60)
}

/**
 * Adds multiple github repositories licenses to the cache
 * @param toCache the information to be cached
 */
export async function cacheGithubRepos(...toCache: ToCache[]) {
    let cache = await getCacheFromStorage();
    // filter out expired repos
    cache = cache.filter(isStillValid);

    for (let newEntry of toCache) {
        const cacheItem: CacheEntry = {
            owner: newEntry.owner,
            repo: newEntry.repo,
            lKey: newEntry.lKey,
            expires: expire(),
        };
        const idx = cache.findIndex(repoMatcher(newEntry.owner, newEntry.repo));
        if (idx == -1) {
            cache.push(cacheItem)
        } else {
            cache[idx] = cacheItem
        }
    }

    return upsertCache(cache)
}

/**
 * Removes all expired entries from the cache.
 * Calling this should have no functional impact on licenseplate, but may free up some space.
 *
 * Note that the expired entries are also removed on essentially all other
 * cache-write operations, hence calling this method is hardly ever needed.
 */
export async function removeExpiredFromCache() {
    // Adding new repos to the cache also removes expired ones
    // Thus adding 0 new repos, only removes the expired ones
    return cacheGithubRepos()
}

/**
 * Removes a specific github repository from the cache.
 * @param owner identifying the owner of the repository to remove
 * @param repo identifying the repository to remove
 */
export async function removeGithubRepoFromCache(owner: string, repo: string) {
    const cache = await getCacheFromStorage();
    const newCache = cache.filter((c: CacheEntry) => {
        return c.repo !== repo || c.owner != owner
    });
    return upsertCache(newCache)
}

