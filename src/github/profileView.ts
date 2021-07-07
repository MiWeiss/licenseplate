import {findLicense} from "./licenseFinder";

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
        const splits = href.split('/');
        console.log(splits[1], splits[2]);
        findLicense(splits[1], splits[2]).then(lic => addLicenseInfoToPin(pin, lic))
    }
}

function addLicenseInfoToPin(pin: Element, lic: string) {
    const lastChild = pin.children[pin.children.length - 1];
    const licenseInfo = document.createElement("span");
    // TODO License Name Instead of key, and Alert level & icon
    licenseInfo.innerText = lic;
    licenseInfo.classList.add("d-inline-block", "mr-3");
    lastChild.appendChild(licenseInfo);
}


//
// Run Script on Page Load
//

main().then(() =>
    console.log("[licenseplate] Profile Parsing: Exit Main (async tasks may still run)")
);

console.log("hello");