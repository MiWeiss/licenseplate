import { AlarmReport } from "../utils/licenses/alarmReportBuilder";
import { getAlarm } from "../utils/licenses/alarmLevel";
import {
  findLicense,
  FOUND_IGNORED_REPO,
  FOUND_NO_LICENSE,
  FOUND_NO_REPO,
  FOUND_UNKNOWN_LICENSE,
} from "./licenseFinder";
import { AlarmLevel } from "../utils/licenses/models";
import { create } from "domain";
import { issueTemplateTask } from "./issueTemplateInsert";
import { ignore, unIgnore } from "../utils/ignoreUtils";

async function licensePlateAlertBar() {
  if (document.getElementById("licenseplate-alertbar")) {
    console.log("[licenseplate] Alertbar already exists. Return. ");
    return;
  }
  let repoContainer = document.getElementById("js-repo-pjax-container");
  if (repoContainer) {
    const { owner, repo } = repoIdFromUrl();

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

    const leftNode = document.createElement("div");
    const rightNode = document.createElement("div");
    leftNode.classList.add("alertbar-head-element", "alertbar-head-left");
    rightNode.classList.add("alertbar-head-element", "alertbar-head-right");

    alertbar.appendChild(leftNode);
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
      leftNode.innerHTML = `
        Repository not found through github API. Are you offline or is this a private repository?`;
      showDetails(alertbar, alertInfo, false);
    } else if (alertInfo.licenseKey === FOUND_UNKNOWN_LICENSE) {
      leftNode.innerHTML = `Looks like this repository
        has a license, but we did not recognize it.
        Check the repository for license details.`;
      showDetails(alertbar, alertInfo, false);
    } else {
      leftNode.innerHTML = `License: 
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
    if (alertInfo?.alarmLevel() === 2) {
      alertbar.classList.add("alertbar");
    }
    repoContainer?.parentNode?.insertBefore(alertbar, repoContainer);
  }
}

function repoIdFromUrl() {
  let splitUrl = window.location.href.split("/");
  let owner = splitUrl[3];
  let repo = splitUrl[4];
  return { owner, repo };
}

function showDetails(
  alertbar: HTMLDivElement,
  alertInfo: AlarmReport,
  printInfos: boolean
) {
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
      ignoreRepoButton(actionElements);
      detailsNode.appendChild(actionElements);

      alertbar.appendChild(detailsNode);
    }
  });
}

function printDetailedAlertReport(
  detailsNode: HTMLDivElement,
  alertInfo: AlarmReport
) {
  const detailsTitle = `Potential Problems with ${alertInfo.licenseKey} license`;
  createDetailsTitle(detailsTitle, detailsNode);

  alertInfo.panics.forEach((m) => addMessageElement("ALERT", m));
  alertInfo.warnings.forEach((m) => addMessageElement("WARNING", m));
  alertInfo.chillRemarks.forEach((m) => addMessageElement("INFO", m));

  function addMessageElement(level: string, message: string): void {
    const messageNode = document.createElement("div");
    messageNode.classList.add("details-element");
    messageNode.innerHTML += `[${level}] ${message} <br>`;
    detailsNode.appendChild(messageNode);
  }
}

function createDetailsTitle(title: string, detailsNode: HTMLDivElement) {
  const messageNode = document.createElement("div");
  messageNode.classList.add("details-element", "details-title");
  messageNode.innerHTML += title;
  detailsNode.appendChild(messageNode);
}

function createIssueButton(details: HTMLDivElement) {
  let { owner, repo } = repoIdFromUrl();
  const createIssue = document.createElement("button");
  createIssue.classList.add("licenseplate-action-button");
  createIssue.innerHTML = `Open Issue`;
  createIssue.id = "btn-create-license-request-issue";
  createIssue.onclick = (e) =>{
    e.stopPropagation();
    (window.location.href = `https://github.com/${owner}/${repo}/issues/new`);
  }
  details.appendChild(createIssue);
}

function ignoreRepoButton(actionElements: HTMLDivElement) {
  let { owner, repo } = repoIdFromUrl();
  const ignoreRepo = document.createElement("button");
  ignoreRepo.classList.add("licensplate-action-button");
  ignoreRepo.onclick = (e) =>  {
    e.stopPropagation();
    onIgnoreEvent(`${owner}/${repo}`, actionElements);
  }
  ignoreRepo.innerHTML = `Ignore this repo`;
  ignoreRepo.id = "btn-ignore-repo";
  ignoreRepo.title = `Prevents the licenseplate extension to run on '${owner}/${repo}'. Can be reverted in extension settings.`;
  actionElements.appendChild(ignoreRepo);
  const ignoreOwner = document.createElement("button");
  ignoreOwner.classList.add("licensplate-action-button");
  ignoreOwner.innerHTML = `Ignore all of this owner`;
  ignoreOwner.id = "btn-ignore-owner";
  ignoreOwner.onclick = (e) =>  { 
    e.stopPropagation()
    onIgnoreEvent(`${owner}/*`, actionElements);
  }
  ignoreOwner.title = `Prevents the licenseplate extension to run on repos from '${owner}'. Can be reverted in extension settings.`;
  actionElements.appendChild(ignoreOwner);
}

async function onIgnoreEvent(id: string, actionElements: HTMLDivElement) {
  await ignore("github", id);
  const confirmationMessage = document.createElement("div");
  confirmationMessage.classList.add("details-element")
  confirmationMessage.innerText = `licenseplate won't consider '${id}' anymore.`;
  const revertButton = document.createElement("button");
  revertButton.innerText = "revert";
  revertButton.onclick = (e) => {
    e.stopPropagation()
    unIgnore("github", id).then((e) => {
      revertButton.remove();
      confirmationMessage.remove();
      actionElements.hidden = false;
    });
  };
  revertButton.classList.add("details-element")
  actionElements.parentElement?.appendChild(confirmationMessage);
  actionElements.parentElement?.appendChild(revertButton);
  actionElements.hidden = true;
  console.log("Appended child")
}


licensePlateAlertBar().then(() =>
  console.log("[licenseplate] Alertbar Creation: Exit")
);
