import {findLicense} from "./licenseFinder";
import {AlarmReport} from "../utils/licenses/alarmReportBuilder";
import {getAlarm} from "../utils/licenses/alarmLevel";
import {AlarmLevel} from "../utils/licenses/models";

// Icons taken from https://feathericons.com/ (height & width manually adapted)
const PANIC_ICON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"red\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-zap\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>"
const WARN_ICON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"orange\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-alert-triangle\"><path d=\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z\"></path><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"13\"></line><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"></line></svg>";
const INFO_ICON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"green\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-check-square\"><polyline points=\"9 11 12 14 22 4\"></polyline><path d=\"M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11\"></path></svg>";

/**
 * Creates a new svg element in the dom
 * containing the requested icon.
 *
 * based on https://stackoverflow.com/a/35385518/2576703
 */
function createWarnIcon(alarmReport: AlarmReport): ChildNode {
    const template = document.createElement('template');
    let svg = "";
    if (alarmReport.alarmLevel() === AlarmLevel.CHILL) {
        svg = INFO_ICON_SVG;
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

async function main() {
    const pins = document.getElementsByClassName("pinned-item-list-item-content");
    console.log(pins);
    if (pins.length === 0) {
        return
    }
    for (let pin of pins) {
        const href = pin.getElementsByClassName('repo')[0]?.parentElement?.getAttribute("href");
        if (!href) {
            console.error(`[licenseplate] found no link for pin`);
            continue;
        }
        console.log("hello");
        const splits = href.split('/');
        console.log(splits[1], splits[2]);
        findLicense(splits[1], splits[2])
            .then(lic => getAlarm(lic))
            .then(r => addLicenseInfoToPin(pin, r))
            .then(() => console.log("added")) // TODO delete
    }
}

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
    wrapperSpan.classList.add("pinned-item-meta");
    wrapperSpan.appendChild(createWarnIcon(alarmReport));
    wrapperSpan.appendChild(licenseInfo);
    wrapperSpan.title = `License status by licenseplate. Visit repo to see details.`;
    lastChild.appendChild(wrapperSpan);
}


//
// Run Script on Page Load
//

main().then(() =>
    console.log("[licenseplate] Profile Parsing: Exit Main (async tasks may still run)")
);

console.log("hello");