import {Conditions, License, Limitations, Permissions} from "../utils/licenses/models";

const fs = require("fs");
const path = require("path");
const fm = require("front-matter");
const choosealicenseRepo = "./.temp/choosealicense.com/";
const util = require("util");
const exec = util.promisify(require("child_process").exec);

/**
 * Parses a single (jekyll) license file from the choosealicense.com repo
 * into a licenseplate license instance.
 *
 * @param file The jekyll license file path
 * @return promise of a licenseplate license instance
 */
async function parseRules(file: string): Promise<License> {
    try {
        let fileHandle = await fs.promises.open(file, "r+");
        let fileContent = await fileHandle.readFile("utf8");
        let parsed = fm(fileContent).attributes;
        const url = `https://choosealicense.com/licenses/${parsed[
            "spdx-id"
            ].toLowerCase()}`;
        const permissions = parsePermissions(parsed["permissions"]);
        const conditions = parseConditions(parsed["conditions"]);
        const limitations = parseLimitations(parsed["limitations"]);
        return <License>{
            title: parsed["title"],
            spdxId: parsed["spdx-id"],
            permissions: permissions,
            conditions: conditions,
            limitations: limitations,
            url: url,
        };
    } catch (e) {
        console.error(e);
        return Promise.reject(e);
    }
}

/**
 * Creates a file of licenseplate license instances,
 * based on the choosealicense clone present on the file system.
 */
async function extractLicenses() {
    // Find all license jekyll files in choosealicense.org
    const licenseFolder = path.join(choosealicenseRepo, "_licenses");
    const files: Array<string> = await fs.promises.readdir(licenseFolder);

    // Extract information from found jekyll files
    const rules = await Promise.all(
        files.map((fileName) => parseRules(`${licenseFolder}/${fileName}`))
    );

    const json = JSON.stringify(rules, null, 2);
    await fs.promises.writeFile("./src/__gen__/licenses.json", json);
}

/**
 * Entry Method for the license code generator.
 *
 * Clones the choosealicense github repository,
 * parses its jekyll license files and writes a file
 * of licenseplate license instances.
 */
export async function generateLicenses() {
    console.log(`using temp 'choosealicense.com' repo at ${choosealicenseRepo}`);
    if (fs.existsSync(choosealicenseRepo)) {
        await exec(`git -C ${choosealicenseRepo} pull`, () => extractLicenses());
    } else {
        await exec(
            `git clone https://github.com/github/choosealicense.com.git ${choosealicenseRepo}`
        );
    }
    await extractLicenses();
}

/**
 * Utility function to parse the list of permissions
 * into boolean values for the permission attributes.
 *
 * @param slugs permission slugs from choosealicense jekyll files.
 */
function parsePermissions(slugs: Array<String>): Permissions<boolean> {
    return <Permissions<boolean>>{
        commercialUse: slugs.some((x) => x === "commercial-use"),
        distribution: slugs.some((x) => x === "distribution"),
        modifications: slugs.some((x) => x === "modifications"),
        privateUse: slugs.some((x) => x === "private-use"),
        patentUse: slugs.some((x) => x === "patent-use"),
    };
}

/**
 * Utility function to parse the list of license conditions
 * into boolean values for the license condition attributes.
 *
 * @param slugs license condition slugs from choosealicense jekyll files.
 */
function parseConditions(slugs: Array<String>): Conditions<boolean> {
    return <Conditions<boolean>>{
        discloseSource: slugs.some((x) => x === "disclose-source"),
        includeCopyright: slugs.some((x) => x === "include-copyright"),
        includeCopyrightVSource: slugs.some(
            (x) => x === "include-copyright--source"
        ),
        networkUseDisclosure: slugs.some((x) => x === "network-use-disclose"),
        sameLicense: slugs.some((x) => x === "same-license"),
        sameLicenseVLibrary: slugs.some((x) => x === "same-license--library"),
        sameLicenseVFile: slugs.some((x) => x === "same-license--file"),
        documentChanges: slugs.some((x) => x === "document-changes"),
    };
}

/**
 * Utility function to parse the list of license limitations
 * into boolean values for the license limitations attributes.
 *
 * @param slugs license limitations slugs from choosealicense jekyll files.
 */
function parseLimitations(slugs: Array<String>): Limitations<boolean> {
    return <Limitations<boolean>>{
        liability: slugs.some((x) => x === "liability"),
        warranty: slugs.some((x) => x === "warranty"),
        trademarkUse: slugs.some((x) => x === "trademark-use"),
        patentUse: slugs.some((x) => x === "patent-use"),
    };
}


// Run the code generator when executing this file
generateLicenses()
    .then(() => console.log("Successfully replaced licenses.json file."))
    .catch((err) => console.error(err));