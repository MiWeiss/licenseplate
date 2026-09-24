import {AlarmLevel} from "../utils/licenses/models";
import {AlarmReport} from "../utils/licenses/alarmReportBuilder";
import {getAlarm} from "../utils/licenses/alarmLevel";

async function checkAlarmLevelForLicenseId(licenseKey: string,
                                           alarmLevel: AlarmLevel) {
    const alarm: AlarmReport = await getAlarm(licenseKey);
    expect(alarm.alarmLevel()).toBe(alarmLevel);
}

test("alarm-level-mit", async () =>
    checkAlarmLevelForLicenseId("mit", AlarmLevel.CHILL));


test("alarm-level-mpl2-0", async () =>
    checkAlarmLevelForLicenseId("mpl-2.0", AlarmLevel.WARN));


test("alarm-messages", async () => {
    const lgplAlarm = await getAlarm("lgpl-3.0");
    expect(lgplAlarm.panics.length).toBe(0);
    expect(lgplAlarm.warnings.length).toBe(2);
    expect(lgplAlarm.chillRemarks.length).toBe(4);
});

test("mock-alarm-messages-are-plain-text", () => {
    // Messages are rendered as text, not as html
    const reports = [
        AlarmReport.FOUND_NO_LICENSE_ALARM_REPORT,
        AlarmReport.FOUND_NO_REPO_ALARM_REPORT,
        AlarmReport.API_LIMIT_REACHED_ALARM_REPORT,
        AlarmReport.API_ERROR_ALARM_REPORT,
        AlarmReport.FOUND_UNKNOWN_LICENSE_ALARM_REPORT,
    ];
    for (const report of reports) {
        for (const message of [...report.panics, ...report.warnings, ...report.chillRemarks]) {
            expect(message).not.toMatch(/<[a-z]/i);
        }
    }
});
