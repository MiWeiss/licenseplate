
export const getGithubAuthToken = async function (): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.get("gh-auth-token", function (value) {
                resolve(value["gh-auth-token"])
            });
        } catch (ex) {
            reject(ex);
        }
    });
};

/**
 * Creates or replaces the github auth token in `storage.sync`
 * @param token new github token
 */
export const upsertGithubAuthToken = async function (token: string | null) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.set({"gh-auth-token": token}, function () {
                resolve(null);
            });
        } catch (ex) {
            reject(ex);
        }
    });
};
