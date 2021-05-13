import {AlarmLevel} from "../utils/licenses/models";
import {AlarmReport} from "../utils/licenses/alarmReportBuilder";
import {getAlarm} from "../utils/licenses/alarmLevel";

async function checkAlarmLevelForLicenseId(
    licenseKey: string,
    alarmLevel: AlarmLevel
) {
    // let licenseInfoMock = {
    //   key: licenseKey,
    // };
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