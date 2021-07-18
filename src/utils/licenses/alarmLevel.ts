import * as licensesJson from "../../__gen__/licenses.json";
import {License} from "./models";
import {AlarmReport} from "./alarmReportBuilder";
import {FOUND_NO_LICENSE, FOUND_NO_REPO, FOUND_UNKNOWN_LICENSE,} from "../../github/licenseFinder";

// TODO There *must* be a better way to cast the json into a map
const licenses: Map<string, License> = new Map();
for (let key in licensesJson) {
    if (key === "default") {
        break;
    }
    licenses.set(licensesJson[key].spdxId.toUpperCase(), licensesJson[key]);
}

/**
 * Resolves, for a given license key, the corresponding AlarmReport which depends on the settings.
 * (e.g. definition of whether a specific missing permission leads to panic, warning or info).
 *
 * For mock keys (e.g. FOUND_NO_LICENSE), corresponding predefined AlarmReports are returned.
 *
 * @param licenseKey The key (spdxId) of the license for which the AlarmReport will be built
 * @returns A promise for the above described AlarmReport
 */
export async function getAlarm(licenseKey: string): Promise<AlarmReport> {
    // Handle preconfigured alarm reports
    if (licenseKey === FOUND_NO_LICENSE) {
        return AlarmReport.FOUND_NO_LICENSE_ALARM_REPORT;
    } else if (licenseKey === FOUND_NO_REPO) {
        return AlarmReport.FOUND_NO_REPO_ALARM_REPORT;
    } else if (licenseKey === FOUND_UNKNOWN_LICENSE) {
        return AlarmReport.FOUND_UNKNOWN_LICENSE_ALARM_REPORT;
    }

    const license: License | undefined = licenses.get(licenseKey.toUpperCase());
    if (license) {
        return new AlarmReport.Builder(license.spdxId, license.title, license.url)
            .reportPermissions(license.permissions)
            .reportConditions(license.conditions)
            .reportLimitations(license.limitations)
            .build();
    } else {
        console.error(
            `Did not find any information about license '${licenseKey}'`
        );
        return AlarmReport.FOUND_UNKNOWN_LICENSE_ALARM_REPORT;
    }
}
