import { title } from "process";

export async function issueTemplateTask(): Promise<string> {
  if (!isNewIssuePage()) {
    return "Not on 'new issue' page";
  }
  try {
    createInsertTemplateButton();
    return "created template button";
  } catch (e) {
    console.error(e);
    return "could not create template button";
  }
}

function isNewIssuePage() {
  return (
    (window.location.href.endsWith("/issues/new") ||
      window.location.href.endsWith("/issues/new/")) &&
    findIssueSubmitButton()
  );
}

function findIssueSubmitButton(): HTMLButtonElement | undefined {
  return Array.from(document.getElementsByTagName("button")).find((elem) => {
    return elem.innerText === "Submit new issue";
  });
}

function createInsertTemplateButton() {
  const submitButton = findIssueSubmitButton();
  if (submitButton) {
    const templateButton = document.createElement("button");
    templateButton.classList.add("licensplate-lic-template-button", "btn");
    templateButton.innerText = "Use License Request Template";
    templateButton.onclick = (ev: MouseEvent) => {
      ev.preventDefault();
      fillInTemplate();
    };
    console.log(templateButton);
    submitButton.parentElement?.insertBefore(templateButton, submitButton);
  } else {
    throw new Error("Could not copy submit button. It disappeared");
  }
}

const LICENSE_REQUEST_TEMPLATE =
    `It appears that this repository does not have a license, which may disallow anyone to use its content (read about this [here](https://choosealicense.com/no-permission/)). Thus, would you mind adding a 'LICENSE' file to your repository?

By the way: To choose a license, [choosealicense.com](https://choosealicense.com/) and [the opensource guide](https://opensource.guide/legal/#which-open-source-license-is-appropriate-for-my-project) are great places to start looking. 
Adding the license to the repo can then easily be done using one of githubs template, as shown [here](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-license-to-a-repository).

Thanks in advance!

<sub>Issue created using the [licenseplate browser extension](https://github.com/MiWeiss/licenseplate), which relies on the GitHub API to identify licenses. This is not legal advice.</sub>
  `;

function fillInTemplate() {
  const titleNode = getTitleNode();
  titleNode.value = "Add a License File";
  try {
    getTab("Write").click();
  } catch (e) {
    // Swallowing error,
    // hoping we're already on the write tab
    console.error(e);
  }
  getCommentNode().value = LICENSE_REQUEST_TEMPLATE;
  // Fire event to make submit button clickable

  try {
    getTab("Preview").click();
  } catch (e) {
    // Swallowing error,
    // it's not a big problem if the user does not see the preview
    console.error(e);
  }
  // Use change event to make submit button clickable
  titleNode.form?.dispatchEvent(new Event("change"))
}

function getTitleNode(): HTMLInputElement {
  const titleField = Array.from(document.getElementsByTagName("input")).find(
    (i) => i.placeholder === "Title"
  );
  if (!titleField) {
    throw new Error("Did not find title field");
  }
  return titleField;
}

function getCommentNode(): HTMLTextAreaElement {
  const commentField = Array.from(
    document.getElementsByTagName("textarea")
  ).find((i) => i.placeholder === "Leave a comment");
  if (!commentField) {
    throw new Error("Did not find comment field");
  }
  return commentField;
}

function getTab(innerText: string): HTMLButtonElement {
  const writeTab = Array.from(document.getElementsByTagName("button")).find(
    (i) => i.innerText === innerText
  );
  if (!writeTab) {
    throw new Error(`Did not find ${innerText} tab`);
  }
  return writeTab;
}
