import * as alarmMessageJson from "./alarmMessages.json";
import * as alarmConfigJson from "./alarmLevels.json";

import {AlarmLevel, Conditions, Limitations, Permissions, Rights,} from "./models";

import {API_LIMIT_REACHED, FOUND_NO_LICENSE, FOUND_NO_REPO, FOUND_UNKNOWN_LICENSE,} from "../../github/licenseFinder";

const alarmMessages: Rights<string> = alarmMessageJson;
const alarmConfig: Rights<AlarmLevel> = alarmConfigJson;

/**
 * AlarmReport is a class containing all required information to show alerts to the users.
 *
 * Such information are information about the identfied license key, name, ...,
 * as well as the restrictions (i.e., missing permissions, conditions and limitations)
 * with their corresponding alert levels.
 */
export class AlarmReport {
    protected constructor(
        readonly licenseKey: string,
        readonly licenseTitle: string,
        readonly panics: Array<string>,
        readonly warnings: Array<string>,
        readonly chillRemarks: Array<string>,
        readonly licenseUrl?: string
    ) {
    }

    /**
     * The overall alarm level.
     * Computed as the highest of all observed alarms in this report.
     */
    public alarmLevel(): AlarmLevel {
        if (this.panics.length > 0) {
            return AlarmLevel.PANIC;
        } else if (this.warnings.length > 0) {
            return AlarmLevel.WARN;
        } else {
            return AlarmLevel.CHILL;
        }
    }

    static FOUND_NO_LICENSE_ALARM_REPORT = new AlarmReport(
        FOUND_NO_LICENSE,
        "No license",
        ["You do not have the permission to use this repo."],
        [],
        [],
        "https://choosealicense.com/no-permission/"
    );

    static FOUND_NO_REPO_ALARM_REPORT = new AlarmReport(
        FOUND_NO_REPO,
        "Private Repo?",
        // No warnings or panic: let's chill if repo not found (it's probably a private repo)
        [],
        [],
        ["Could not access repo info. Is this a private repo?"]
    );


    static API_LIMIT_REACHED_ALARM_REPORT = new AlarmReport(
        API_LIMIT_REACHED,
        "API limit reached",
        // No warnings or panic: let's chill if repo not found (it's probably a private repo)
        ["Could not access repo info - looks like your API limit is reached or your token is invalid. " +
        "Consider adding an auth token in the extension options. " +
        "<a href='https://miweiss.github.io/licenseplate/features-gh/auth/' target='_blank'> Read More Here </a>"],
        [],
        [],
        "https://miweiss.github.io/licenseplate/features-gh/auth/"
    );

    static FOUND_UNKNOWN_LICENSE_ALARM_REPORT = new AlarmReport(
        FOUND_UNKNOWN_LICENSE,
        "Unknown License",
        ["Unknown license. Please check manually."],
        [],
        []
    );

    /**
     * Builder class used to create AlarmReports
     */
    static Builder = class {
        panics: Array<string> = [];
        warnings: Array<string> = [];
        chillRemarks: Array<string> = [];

        /**
         * AlarmReport-Builder constructor
         * @param licenseKey spdx-id based license key
         * @param licenseTitle full name of the license
         * @param licenseUrl license info url (typically on choosealicense.com, for consistency)
         */
        constructor(readonly licenseKey: string,
                    readonly licenseTitle: string,
                    readonly licenseUrl?: string) {
        }

        /**
         * Given permissions, identifies missing permissions and adds them,
         * with their alarm-levels, to the AlarmReport
         * @param l license permissions
         */
        public reportPermissions(l: Permissions<boolean>) {
            if (!l.commercialUse) {
                this.report(
                    alarmConfig.permissions.commercialUse,
                    alarmMessages.permissions.commercialUse
                );
            }
            if (!l.distribution) {
                this.report(
                    alarmConfig.permissions.distribution,
                    alarmMessages.permissions.distribution
                );
            }
            if (!l.modifications) {
                this.report(
                    alarmConfig.permissions.modifications,
                    alarmMessages.permissions.modifications
                );
            }
            if (!l.privateUse) {
                this.report(
                    alarmConfig.permissions.privateUse,
                    alarmMessages.permissions.privateUse
                );
            }
            if (!l.patentUse) {
                this.report(
                    alarmConfig.permissions.patentUse,
                    alarmMessages.permissions.patentUse
                );
            }
            return this;
        }

        /**
         * Adds the given conditions to the AlarmReport with their alarm level
         * @param l license conditions
         */
        public reportConditions(l: Conditions<boolean>) {
            if (l.discloseSource) {
                this.report(
                    alarmConfig.conditions.discloseSource,
                    alarmMessages.conditions.discloseSource
                );
            }
            if (l.includeCopyright) {
                this.report(
                    alarmConfig.conditions.includeCopyright,
                    alarmMessages.conditions.includeCopyright
                );
            }
            if (l.includeCopyrightVSource) {
                this.report(
                    alarmConfig.conditions.includeCopyrightVSource,
                    alarmMessages.conditions.includeCopyrightVSource
                );
            }
            if (l.networkUseDisclosure) {
                this.report(
                    alarmConfig.conditions.networkUseDisclosure,
                    alarmMessages.conditions.networkUseDisclosure
                );
            }
            if (l.sameLicense) {
                this.report(
                    alarmConfig.conditions.sameLicense,
                    alarmMessages.conditions.sameLicense
                );
            }
            if (l.sameLicenseVLibrary) {
                this.report(
                    alarmConfig.conditions.sameLicenseVLibrary,
                    alarmMessages.conditions.sameLicenseVLibrary
                );
            }
            if (l.sameLicenseVFile) {
                this.report(
                    alarmConfig.conditions.sameLicenseVFile,
                    alarmMessages.conditions.sameLicenseVFile
                );
            }
            if (l.documentChanges) {
                this.report(
                    alarmConfig.conditions.documentChanges,
                    alarmMessages.conditions.documentChanges
                );
            }
            return this;
        }

        /**
         * Adds the given limitations to the AlarmReport with their alarm level
         * @param l license limitations
         */
        public reportLimitations(l: Limitations<boolean>) {
            if (l.liability) {
                this.report(
                    alarmConfig.limitations.liability,
                    alarmMessages.limitations.liability
                );
            }
            if (l.warranty) {
                this.report(
                    alarmConfig.limitations.warranty,
                    alarmMessages.limitations.warranty
                );
            }
            if (l.trademarkUse) {
                this.report(
                    alarmConfig.limitations.trademarkUse,
                    alarmMessages.limitations.trademarkUse
                );
            }
            if (l.patentUse) {
                this.report(
                    alarmConfig.limitations.patentUse,
                    alarmMessages.limitations.patentUse
                );
            }
            return this;
        }

        private report(alertLevel: AlarmLevel, message: string) {
            switch (alertLevel) {
                case AlarmLevel.CHILL:
                    this.chillRemarks.push(message);
                    break;
                case AlarmLevel.WARN:
                    this.warnings.push(message);
                    break;
                case AlarmLevel.PANIC:
                    this.panics.push(message);
                    break;
                default:
                    console.error(`Unknown alarm level ${alertLevel}.`);
                    this.panics.push(
                        `LICENSEPLATE internal error. Please check console output and report an issue.`
                    );
            }
            return this;
        }

        /**
         * Builds the AlarmReport instance
         */
        public build(): AlarmReport {
            return new AlarmReport(
                this.licenseKey,
                this.licenseTitle,
                this.panics,
                this.warnings,
                this.chillRemarks,
                this.licenseUrl
            );
        }
    };
}
