import {AlarmReport} from "../utils/licenses/alarmReportBuilder";
import {getAlarm} from "../utils/licenses/alarmLevel";
import {
    findLicense,
    FOUND_IGNORED_REPO,
    FOUND_NO_LICENSE,
    FOUND_NO_REPO,
    FOUND_UNKNOWN_LICENSE,
} from "./licenseFinder";
import {AlarmLevel} from "../utils/licenses/models";
import {issueTemplateTask} from "./issueTemplateInsert";
import {ignore, unIgnore} from "../utils/ignoreUtils";
import {removeGithubRepoFromCache} from "../utils/cacheUtils";

/**
 * Initiates repository page enrichment.
 * Resolves the repository key (owner & name), finds the license information
 * and adds the alertbar to the dom tree.
 *
 * If the current page is a 'create issue' page, and the repo has no license,
 * the page is furthermore enriched with the request-a-license template button.
 */
async function main() {
    if (document.getElementById("licenseplate-alertbar")) {
        console.log("[licenseplate] Alertbar already exists. Return. ");
        return;
    }
    let repoContainer = document.getElementById("js-repo-pjax-container");
    if (repoContainer) {
        const {owner, repo} = repoIdFromUrl();

        const licenseKey = await findLicense(owner, repo);
        if (licenseKey === FOUND_IGNORED_REPO) {
            console.log("Licenseplate abort: Ignored repo");
            return;
        }
        const alertInfo = await getAlarm(licenseKey);

        const alertbar = document.createElement("div");
        alertbar.classList.add(
            ..."alertbar d-flex mb-3 px-3 px-md-4 px-lg-5".split(" ")
        );
        alertbar.setAttribute("id", "licenseplate-alertbar");


        setAlertBarContent(alertInfo, alertbar);

        setAlertLevel(alertInfo, alertbar);
        repoContainer?.parentNode?.insertBefore(alertbar, repoContainer);
    }
}

/**
 * Adds the alarm-level specific class to the alertbar,
 * leading amongst others to proper coloring.
 *
 * @param alertInfo The alarmReport, containing the info about the alarm level
 * @param alertbar The alertbar as HTMLElement
 */
function setAlertLevel(alertInfo: AlarmReport, alertbar: HTMLDivElement) {
    switch (alertInfo.alarmLevel()) {
        case AlarmLevel.PANIC: {
            alertbar.classList.add("licpl-panic");
            break;
        }
        case AlarmLevel.WARN: {
            alertbar.classList.add("licpl-warning");
            break;
        }
        case AlarmLevel.CHILL: {
            alertbar.classList.add("licpl-chill");
            break;
        }
        default: {
            console.error(
                `[Licenseplate] Unexpected value in AlarmLevel Switch Statement ${alertInfo.alarmLevel()}`
            );
            break;
        }
    }
}

/**
 * Fills an empty alertbar with content, based on a passed AlarmReport
 * @param alertInfo the AlarmReport containing the info to be shown on the alertbar
 * @param alertbar The (empty) html div element to be filled with info.
 */
function setAlertBarContent(alertInfo: AlarmReport,
                            alertbar: HTMLDivElement) {

    const leftNode = document.createElement("div");
    alertbar.appendChild(leftNode);
    leftNode.classList.add("alertbar-head-element", "alertbar-head-left");

    const rightNode = document.createElement("div");
    rightNode.classList.add("alertbar-head-element", "alertbar-head-right");
    alertbar.appendChild(rightNode);
    rightNode.innerHTML = "[Licenseplate-Extension. This is not legal advice]";

    if (alertInfo.licenseKey === FOUND_NO_LICENSE) {
        leftNode.innerHTML = `Found no license! 
        You may not be allowed to use this code. 
        <a href="https://choosealicense.com/no-permission/" target="_blank">
        Read more</a>`;
        showDetails(alertbar, alertInfo, false);
        issueTemplateTask().then((m) =>
            console.log(`[licenseplate] Exit Issue Template Setup: ${m}`)
        );
    } else if (alertInfo.licenseKey === FOUND_NO_REPO) {
        leftNode.innerHTML =
            `Repository not found through github API. Are you offline or is this a private repository?`;
        showDetails(alertbar, alertInfo, false);
    } else if (alertInfo.licenseKey === FOUND_UNKNOWN_LICENSE) {
        leftNode.innerHTML =
            `Looks like this repository
            has a license, but we did not recognize it.
            Check the repository for license details.`;
        showDetails(alertbar, alertInfo, false);
    } else {
        leftNode.innerHTML =
            `License: 
              <a href="${alertInfo.licenseUrl}" target="_blank"> 
              ${alertInfo.licenseKey}</a>`;

        const centerNode = document.createElement("div");
        centerNode.classList.add("alertbar-head-element", "alertbar-head-center");
        alertbar.insertBefore(centerNode, rightNode);

        centerNode.innerHTML = `
                  ${alertInfo.panics.length} alerts, 
                  ${alertInfo.warnings.length} warnings,  
                  ${alertInfo.chillRemarks.length} infos`;
        showDetails(alertbar, alertInfo, true);
    }
}

/**
 * Reads the repository owner and repository name from the current url.
 *
 * @returns A tuple consisting of two strings, owner and repo
 */
function repoIdFromUrl() {
    let splitUrl = window.location.href.split("/");
    let owner = splitUrl[3];
    let repo = splitUrl[4];
    return {owner, repo};
}

/**
 * Adds an eventlistener to the alertbar, waiting for clicks,
 * to then uncollapse the alertbar and display more information.
 * @param alertbar The alertbar to be clicked on
 * @param alertInfo Contains the (detailed) info to be shown in the uncollapsed alertbar
 * @param printInfos Iff true, shows all missing permissions, found limitations and found conditions.
 * This should typically only be true for actual (found and known) licenses, but not if e.g. no license was found.
 */
function showDetails(alertbar: HTMLDivElement,
                     alertInfo: AlarmReport,
                     printInfos: boolean) {
    alertbar.addEventListener("click", function (e) {
        let details = document.getElementById("licenseplateAlertDetails");
        if (details) {
            details.remove();
        } else {
            let detailsNode = document.createElement("div");
            detailsNode.classList.add("details");
            detailsNode.id = "licenseplateAlertDetails";

            if (printInfos) {
                printDetailedAlertReport(detailsNode, alertInfo);
            }

            createDetailsTitle("Licenseplate Actions", detailsNode);
            const actionElements = document.createElement("div");
            actionElements.classList.add("details-element", "details-actions");

            if (alertInfo.licenseKey === FOUND_NO_LICENSE) {
                createIssueButton(actionElements);
            }
            createIgnoreButtons(actionElements);
            createRefreshButton(actionElements);
            detailsNode.appendChild(actionElements);

            alertbar.appendChild(detailsNode);
        }
    });
}

/**
 * Lists all missing permissions, found limitations and found conditions in a passed HTMLElement
 * @param detailsNode The element on which the info is to be added
 * @param alertInfo Contains the information about permissions, limitations and conditions.
 */
function printDetailedAlertReport(detailsNode: HTMLDivElement,
                                  alertInfo: AlarmReport) {
    if (alertInfo.panics.length > 0) {
        createDetailsTitle("Panic", detailsNode);
        alertInfo.panics.forEach((m, count) => addMessageElement(m, count));
    }
    if (alertInfo.warnings.length > 0) {
        createDetailsTitle("Warnings", detailsNode);
        alertInfo.warnings.forEach((m, count) => addMessageElement(m, count));
    }
    if (alertInfo.chillRemarks.length > 0) {
        createDetailsTitle("Info", detailsNode);
        alertInfo.chillRemarks.forEach((m, count) => addMessageElement(m, count));
    }


    function addMessageElement(message: string, count: number): void {
        const messageNode = document.createElement("div");
        messageNode.classList.add("details-element");
        messageNode.innerHTML += `(${count+1}) ${message} <br>`;
        detailsNode.appendChild(messageNode);
    }
}

/**
 * Creates a header element for the 'details' section in the uncollapsed alertbar.
 * @param title The name of the header
 * @param detailsNode The node to whose children the title should be added
 */
function createDetailsTitle(title: string, detailsNode: HTMLDivElement) {
    const messageNode = document.createElement("div");
    messageNode.classList.add("details-element", "details-title");
    messageNode.innerHTML += title;
    detailsNode.appendChild(messageNode);
}

/**
 * Creates a button to refresh (i.e., reload ignoring cache) the alertbar
 * @param actionElements HTMLElement to whose children the button will be added.
 */
function createRefreshButton(actionElements: HTMLDivElement) {
    let {owner, repo} = repoIdFromUrl();
    const oncClick = async () => {
        await removeGithubRepoFromCache(owner, repo);
        document.getElementById("licenseplate-alertbar")?.remove();
        await main();
        console.log("[licenseplate] finished regenerating after cache removal");
    };
    createActionButton(
        actionElements,
        "btn-refresh-repo",
        `Refresh`,
        oncClick,
        `Clears this repo from the licenseplate cache and reloads info from github API.`
    );
}

/**
 * Generic function to create action buttons (e.g. for ignore  actions)
 * @param actionElements  HTMLElement to whose children the button will be added.
 * @param id html id attribute of the button
 * @param innerHTML html innerHTML attribute of the button
 * @param onClick onclick event of the button
 * @param title optional title of the button (typically shown by browsers upon hovering over button)
 */
function createActionButton(actionElements: HTMLDivElement,
                            id: string,
                            innerHTML: string,
                            onClick: ((this: GlobalEventHandlers, ev: MouseEvent) => any),
                            title: string | null = null) {

    const createIssue = document.createElement("button");
    createIssue.classList.add("licenseplate-action-button");
    createIssue.innerHTML = innerHTML;
    createIssue.id = id;
    createIssue.onclick = onClick;
    if (title) {
        createIssue.title = title
    }
    actionElements.appendChild(createIssue);
}

/**
 * Creates a button to forward a user to the repositories 'create issue' page
 * where they're expected to ask for a license.
 *
 * @param actionElements HTMLElement to whose children the button will be added.
 */
function createIssueButton(actionElements: HTMLDivElement) {

    const onclick = (e: MouseEvent) => {
        e.stopPropagation();
        const {owner, repo} = repoIdFromUrl();
        (window.location.href = `https://github.com/${owner}/${repo}/issues/new`);
    };

    createActionButton(
        actionElements,
        "btn-create-license-request-issue",
        "Open Issue",
        onclick
    );

}

/**
 * Creates two buttons to ignore owner and repo, i.e., to not resolve any licenses
 * for repos of the current repos owner, or the current repo, respectively.
 *
 * @param actionElements HTMLElement to whose children the button will be added.
 */
function createIgnoreButtons(actionElements: HTMLDivElement) {
    let {owner, repo} = repoIdFromUrl();

    const onIgnoreRepo = (e: MouseEvent) => {
        e.stopPropagation();
        onIgnoreEvent(`${owner}/${repo}`, actionElements);
    };

    createActionButton(
        actionElements,
        "btn-ignore-repo",
        "Ignore Repo",
        onIgnoreRepo,
        `Prevents the licenseplate extension to run on '${owner}/${repo}'.
Can be reverted in extension settings.`
    );

    const onIgnoreOwner = (e: MouseEvent) => {
        e.stopPropagation();
        onIgnoreEvent(`${owner}/*`, actionElements);
    };

    createActionButton(
        actionElements,
        "btn-ignore-owner",
        "Ignore Owner",
        onIgnoreOwner,
        `Prevents the licenseplate extension to run on repos from '${owner}'.
Can be reverted in extension settings.`
    );
}

/**
 * Callback to be executed when a user chooses to ignore a repo or a repo owner.
 *
 * Provides the user with an instant option to revert his action
 * (in case they clicked by mistake).
 *
 * @param id the id of the clicked button
 * @param actionElements the html element which will contain the revert-options
 */
async function onIgnoreEvent(id: string, actionElements: HTMLDivElement) {
    await ignore("github", id);
    const confirmationMessage = document.createElement("div");
    confirmationMessage.classList.add("details-element");
    confirmationMessage.innerHTML = `licenseplate won't consider '${id}' anymore.`;
    const revertButton = document.createElement("button");
    revertButton.innerText = "revert";
    revertButton.id = "licenseplate-ignore-revert-btn";
    revertButton.onclick = (e) => {
        e.stopPropagation();
        unIgnore("github", id).then((e) => {
            revertButton.remove();
            confirmationMessage.remove();
            actionElements.hidden = false;
        });
    };
    revertButton.classList.add("details-element");
    actionElements.parentElement?.appendChild(confirmationMessage);
    actionElements.parentElement?.appendChild(revertButton);
    actionElements.hidden = true;
    console.log("Appended child")
}

//
// Run Script on Page Load
//

main().then(() =>
    console.log("[licenseplate] Alertbar Creation: Exit Main (async tasks may still run)")
);
