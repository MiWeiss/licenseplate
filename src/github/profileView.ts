import {findLicense} from "./licenseFinder";
import {AlarmReport} from "../utils/licenses/alarmReportBuilder";
import {getAlarm} from "../utils/licenses/alarmLevel";
import {AlarmLevel} from "../utils/licenses/models";
import {INFO_ICON_SVG, OK_ICON_SVG, PANIC_ICON_SVG, WARN_ICON_SVG} from "../utils/icons";


/**
 * Creates a new svg element in the dom containing the requested icon.
 *
 * based on https://stackoverflow.com/a/35385518/2576703
 */
function createWarnIcon(alarmReport: AlarmReport): ChildNode {
    const template = document.createElement('template');
    let svg = "";
    if (alarmReport.alarmLevel() === AlarmLevel.CHILL) {
        svg = OK_ICON_SVG;
    } else if (alarmReport.alarmLevel() === AlarmLevel.WARN) {
        svg = WARN_ICON_SVG;
    } else if (alarmReport.alarmLevel() === AlarmLevel.PANIC) {
        svg = PANIC_ICON_SVG;
    } else {
        throw TypeError(`Unexpected Alarm Report Level ${alarmReport.alarmLevel()}`)
    }
    svg = svg.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = svg;
    if (!template.content.firstChild) {
        throw new DOMException("Could not create icon");
    }
    return template.content.firstChild;
}

/**
 * Initiates profile page enrichment:
 * Looks for pins and then adds badges to said pins.
 */
async function main() {
    const pins = document.getElementsByClassName("pinned-item-list-item-content");
    if (pins.length === 0) {
        return
    }
    for (let pin of pins) {
        const href = pin.getElementsByClassName('repo')[0]?.parentElement?.getAttribute("href");
        if (!href) {
            console.error(`[licenseplate] found no link for pin`);
            continue;
        }
        const splits = href.split('/');
        findLicense(splits[1], splits[2])
            .then(lic => getAlarm(lic))
            .then(r => addLicenseInfoToPin(pin, r))
    }
}

/**
 * Displays information for a given license and alarmlevel on a specific pin
 * @param pin The pin HTMLElement on which the license info is to be shown
 * @param alarmReport Contains the information to be shown on the pin
 */
function addLicenseInfoToPin(pin: Element, alarmReport: AlarmReport) {
    const lastChild = pin.children[pin.children.length - 1];
    const licenseInfo = document.createElement("span");
    if (alarmReport.licenseTitle.length > 10) {
        licenseInfo.innerText = alarmReport.licenseKey.toUpperCase();
    } else {
        licenseInfo.innerText = alarmReport.licenseTitle;
    }
    licenseInfo.classList.add("d-inline-block", "mr-3");
    const wrapperSpan = document.createElement("span");
    wrapperSpan.classList.add("pinned-item-meta", "licenseplate-badge");
    wrapperSpan.appendChild(createWarnIcon(alarmReport));
    wrapperSpan.appendChild(licenseInfo);
    wrapperSpan.title = `License status by licenseplate. Visit repo to see details.`;
    lastChild.appendChild(wrapperSpan);
}


//
// Run Script on Page Load
//
main().then(() =>
    console.log("[licenseplate] Profile Parsing: Exit Main (async tasks may still be running)")
);
