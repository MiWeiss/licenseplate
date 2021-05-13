import { checkIsIgnored } from "../utils/ignoreUtils"

test("test-ignored-owner-matcher", async () =>{
    // TODO Also use proper mock of chrome sync api
    const syncState = ["github/ownerOne/*", "github/irrelevantOwner/ASD"]
    await expect(checkIsIgnored("github", "ownerOne/RepoOne", syncState)).resolves.toBe(true)
    await expect(checkIsIgnored("github", "ownerTwo/RepoOne", syncState)).resolves.toBe(false)
})

test("test-ignored-repo-matcher", async () =>{
    // TODO Also use proper mock of chrome sync api
    const syncState = ["github/ownerOne/RepoOne", "github/irrelevantOwner/ASD"]
    await expect(checkIsIgnored("github", "ownerOne/RepoOne", syncState)).resolves.toBe(true)
    await expect(checkIsIgnored("github", "ownerTwo/RepoOne", syncState)).resolves.toBe(false)
    await expect(checkIsIgnored("github", "ownerOne/RepoTwo", syncState)).resolves.toBe(false)
})


// TODO Test for add-ignore (once chrome sync api is mocked) (also check that 'more general' are removed)
// TODO Test for un-ignore (once chrome sync api is mocked)