import {repoIdFromPath} from "../github/repoId";

test("repo-id-from-path", () => {
    expect(repoIdFromPath("/someOwner/some-repo")).toEqual({owner: "someOwner", repo: "some-repo"});
    expect(repoIdFromPath("/someOwner/some-repo/issues/new")).toEqual({owner: "someOwner", repo: "some-repo"});
});

test("repo-id-ignores-query-and-hash", () => {
    const url = new URL("https://github.com/someOwner/some-repo?tab=readme-ov-file#readme");
    expect(repoIdFromPath(url.pathname)).toEqual({owner: "someOwner", repo: "some-repo"});
});
