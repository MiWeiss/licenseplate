import {licenseRequestIssueUrl} from "../github/licenseRequestIssue";

test("license-request-issue-url", () => {
    const url = new URL(licenseRequestIssueUrl("someOwner", "some-repo"));
    expect(url.origin + url.pathname).toBe("https://github.com/someOwner/some-repo/issues/new");
    expect(url.searchParams.get("title")).toBe("Add a License File");
    const body = url.searchParams.get("body");
    expect(body).toContain("does not have a license");
    expect(body).toContain("[choosealicense.com](https://choosealicense.com/)");
});
