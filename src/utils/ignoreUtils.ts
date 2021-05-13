const identifier = (platform: string, id: string) => `${platform}/${id}`;

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

export async function unIgnore(platform: string, id: string) {
  const key = identifier(platform, id);
  return unIgnoreKey(key);
}

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
      const existingRecord = ignoreRecords[i]
      if (existingRecord.match(key)){
        ignoreRecords.splice(i, 1)
      }
    }
    // Add new ignore record
    ignoreRecords.push(key);
    return upsertIgnoredOnSync(ignoreRecords);
  }
}

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
