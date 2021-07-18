const identifier = (platform: string, id: string) => `${platform}/${id}`;

/**
 * Gets the ignore-list from `storage.sync`
 * (which, dependent on the browser, may be synced amongst a users devices).
 *
 * Typically, you don't want to call this method directly, but call {@link checkIsIgnored} instead.
 */
export const getIgnoredFromSync = async function (): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get("ignored-repos", function (value) {
        const result = value["ignored-repos"];
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
 * Creates or replaces ignore-list in `storage.sync`
 * @param keys new ignore-list
 */
const upsertIgnoredOnSync = async function (keys: Array<string>) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.set({ "ignored-repos": keys }, function () {
        resolve(null);
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

/**
 * Remove an item from the ignore-list
 * @param platform The applicable platform (e.g. "github")
 * @param id The ignore-entry identifier (e.g. "miweiss/*")
 */
export async function unIgnore(platform: string, id: string) {
  const key = identifier(platform, id);
  return unIgnoreKey(key);
}

/**
 * Remove an item from the ignore-list with a pre-constructed ignore key.
 * @param key The ignore key entry
 */
export async function unIgnoreKey(key: string) {
  const ignoreRecords: Array<string> = await getIgnoredFromSync();
  const index = ignoreRecords.indexOf(key);
  if (index < 0) {
    console.log(
      `[licenseplate] cannot un-ignore ${key}: no such ignore record`
    );
  } else {
    ignoreRecords.splice(index, 1);
    return upsertIgnoredOnSync(ignoreRecords);
  }
}

/**
 * Add a new item to the ignore-list
 * @param platform the corresponding platform (e.g. "github")
 * @param id the platform-specific ignore id (e.g. "miweiss/licenseplate")
 */
export async function ignore(platform: string, id: string) {
  const ignoreRecords: Array<string> = await getIgnoredFromSync();
  const key = identifier(platform, id);
  const isAlreadyIgnored = await checkIsIgnored(platform, id, ignoreRecords);
  if (isAlreadyIgnored) {
    console.log(
      `[licenseplate] ${key} is already ignored. Not changing anything.`
    );
  } else {
    // Remove less general, existing patterns.
    for (let i = ignoreRecords.length-1; i >= 0; i--){
      const existingRecord = ignoreRecords[i];
      if (existingRecord.match(key)){
        ignoreRecords.splice(i, 1)
      }
    }
    // Add new ignore record
    ignoreRecords.push(key);
    return upsertIgnoredOnSync(ignoreRecords);
  }
}

/**
 * Checks if a given entry is ignored.
 *
 * This method resolves wildcards in ignore pattern.
 *
 * @example
 * E.g. {platform: "github", id: "miweiss/licenseplate", ignoreRecords ["github/miweiss/*]}
 * will ignore the repo.
 *
 * @param platform the corresponding platform (e.g. "github")
 * @param id the platform-specific ignore id (e.g. "miweiss/licenseplate")
 * @param ignoreRecords Optional. The list of ignore-entries. If not provided, it will be loaded from `storage.sync`.
 */
export async function checkIsIgnored(
  platform: string,
  id: string,
  ignoreRecords?: Array<string>
): Promise<boolean> {
  if (!ignoreRecords) {
    ignoreRecords = await getIgnoredFromSync();
  }
  const key = identifier(platform, id);
  for (const ignoredPattern of ignoreRecords) {
    if (key.match(ignoredPattern)) {
      return true;
    }
  }
  return false;
}
