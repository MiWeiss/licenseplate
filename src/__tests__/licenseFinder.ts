import {API_ERROR, API_LIMIT_REACHED, findKeyFromAPI, FOUND_NO_LICENSE, FOUND_NO_REPO} from "../github/licenseFinder";

function mockFetchResponse(status: number, body: object = {}) {
    global.fetch = jest.fn(() => Promise.resolve({
        status: status,
        ok: status >= 200 && status < 300,
        json: () => Promise.resolve(body),
    })) as unknown as typeof fetch;
}

test.each([
    [404, FOUND_NO_REPO],
    [401, API_LIMIT_REACHED],
    [403, API_LIMIT_REACHED],
    [429, API_LIMIT_REACHED],
    [500, API_ERROR],
    [503, API_ERROR],
])("api-status-%i", async (status, expectedKey) => {
    mockFetchResponse(status);
    await expect(findKeyFromAPI("owner", "repo")).resolves.toBe(expectedKey);
});

test("api-license-key", async () => {
    mockFetchResponse(200, {license: {key: "mit"}});
    await expect(findKeyFromAPI("owner", "repo")).resolves.toBe("mit");
});

test("api-no-license", async () => {
    mockFetchResponse(200, {license: null});
    await expect(findKeyFromAPI("owner", "repo")).resolves.toBe(FOUND_NO_LICENSE);
});

test("api-network-error", async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError("Failed to fetch"))) as unknown as typeof fetch;
    await expect(findKeyFromAPI("owner", "repo")).resolves.toBe(API_ERROR);
});
