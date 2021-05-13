import { getIgnoredFromSync, unIgnore, unIgnoreKey } from "./utils/ignoreUtils";

async function showIgnored() {
  const ignored_repos_container = document.getElementById("ignored-repos");
  console.log("1");
  if (ignored_repos_container) {
    console.log("2 ");
    const allIgnored = await getIgnoredFromSync();
    for (const ignored of allIgnored) {
      console.log(ignored);
      const entryDiv = document.createElement("div");
      entryDiv.classList.add("ignored-repo-entry");
      const trashIcon = document.createElement("img");
      trashIcon.classList.add("classlist-trash-icon");
      trashIcon.src = "trash-2.svg";
      const text = document.createElement("p");
      text.innerText = ignored;
      trashIcon.onclick = (e) => deleteIgnoreEntry(ignored, trashIcon, text);
      entryDiv.append(trashIcon, text);
      ignored_repos_container.appendChild(entryDiv);
    }
    if (allIgnored.length === 0){
      ignored_repos_container.innerText = "No ignored repos"
      ignored_repos_container.classList.add("no-ignored-repos-message")
    }
  } else {
    console.error("no div with id 'ignored-repos' found");
  }
}

showIgnored().then(() => console.log("Successfully added ignored options"));

function deleteIgnoreEntry(
  key: string,
  trashIcon: HTMLImageElement,
  text: HTMLParagraphElement
): void {
  unIgnoreKey(key)
    .then(() => {
      trashIcon.remove();
      text.classList.add("deleted");
    })
    .catch((reason) => console.error(`Could not un-ignore ${key}: ${reason}`));
}
