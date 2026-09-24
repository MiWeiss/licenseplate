import { checkIsIgnored, ignore } from "../utils/ignoreUtils"

test("test-ignored-owner-matcher", async () =>{
    // TODO Also use proper mock of chrome sync api
    const syncState = ["github/ownerOne/*", "github/irrelevantOwner/ASD"];
    await expect(checkIsIgnored("github", "ownerOne/RepoOne", syncState)).resolves.toBe(true);
    await expect(checkIsIgnored("github", "ownerTwo/RepoOne", syncState)).resolves.toBe(false)
});

test("test-ignored-repo-matcher", async () =>{
    // TODO Also use proper mock of chrome sync api
    const syncState = ["github/ownerOne/RepoOne", "github/irrelevantOwner/ASD"];
    await expect(checkIsIgnored("github", "ownerOne/RepoOne", syncState)).resolves.toBe(true);
    await expect(checkIsIgnored("github", "ownerTwo/RepoOne", syncState)).resolves.toBe(false);
    await expect(checkIsIgnored("github", "ownerOne/RepoTwo", syncState)).resolves.toBe(false)
})


test("test-ignored-no-partial-matches", async () => {
    const syncState = ["github/ownerOne/*", "github/ownerTwo/RepoOne"];
    await expect(checkIsIgnored("github", "ownerOneX/RepoOne", syncState)).resolves.toBe(false);
    await expect(checkIsIgnored("github", "ownerTwo/RepoOne-extras", syncState)).resolves.toBe(false);
    await expect(checkIsIgnored("github", "xownerTwo/RepoOne", syncState)).resolves.toBe(false);
});

test("test-ignored-no-regex", async () => {
    const syncState = ["github/ownerOne/my.repo"];
    await expect(checkIsIgnored("github", "ownerOne/my.repo", syncState)).resolves.toBe(true);
    await expect(checkIsIgnored("github", "ownerOne/myXrepo", syncState)).resolves.toBe(false);
});

test("test-ignored-case-insensitive", async () => {
    const syncState = ["github/OwnerOne/*", "github/ownerTwo/RepoOne"];
    await expect(checkIsIgnored("github", "ownerone/repoOne", syncState)).resolves.toBe(true);
    await expect(checkIsIgnored("github", "OWNERTWO/repoone", syncState)).resolves.toBe(true);
});

test("test-ignore-owner-replaces-its-repos-only", async () => {
    // In-memory mock of chrome's storage.sync
    const store: { [key: string]: any } = {"ignored-repos": ["github/ownerOne/RepoOne", "github/ownerOneX/RepoOne"]};
    (global as any).chrome = {
        storage: {
            sync: {
                get: (key: string, callback: (value: object) => void) => callback({[key]: store[key]}),
                set: (items: object, callback: () => void) => {
                    Object.assign(store, items);
                    callback();
                },
            },
        },
    };
    await ignore("github", "ownerOne/*");
    expect(store["ignored-repos"]).toEqual(["github/ownerOneX/RepoOne", "github/ownerOne/*"]);
});
