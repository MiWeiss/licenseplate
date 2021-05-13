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

const upsertCache = async function (cacheEntries: Array<CacheEntry>) {
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

const isStillValid = (ce: CacheEntry) => ce.expires > Date.now();

function repoMatcher(owner: string, repo: string) {
    return (ce: CacheEntry) => ce.repo === repo && ce.owner === owner
}

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


function expire(key: any): number {
    // TODO Expire duration dependent on whether license was found or not
    // Cache expires after one hour
    return Date.now() + (1000 * 60 * 60)
}

export async function cacheGithubRepos(...toCache: ToCache[]) {
    let cache = await getCacheFromStorage();
    // filter out expired repos
    cache = cache.filter(isStillValid);

    for (let newEntry of toCache) {
        const cacheItem: CacheEntry = {
            owner: newEntry.owner,
            repo: newEntry.repo,
            lKey: newEntry.lKey,
            expires: expire(newEntry.lKey),
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

export async function removeExpiredFromCache() {
    // Adding new repos to the cache also removes expired ones
    // Thus adding 0 new repos, only removes the expired ones
    return cacheGithubRepos()
}
