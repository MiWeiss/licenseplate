import {getIgnoredFromSync, unIgnoreKey} from "./utils/ignoreUtils";
import {getCacheFromStorage, isStillValid, upsertCache} from "./utils/cacheUtils";

/**
 * Modifies the options-DOMtree to show a list of all ignore-keys,
 * with the options to delete them individually.
 *
 * Method expected to run on page load.
 */
async function showIgnored() {
    const ignored_repos_container = document.getElementById("ignored-repos");
    if (ignored_repos_container) {
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
        if (allIgnored.length === 0) {
            ignored_repos_container.innerText = "No ignored repos";
            ignored_repos_container.classList.add("no-ignored-repos-message")
        }
    } else {
        console.error("no div with id 'ignored-repos' found");
    }
}

/**
 * Modifies the options-DOMtree to show information about the cache size.
 *
 * Method expected to run on page load.
 */
async function displayCacheInfo() {
    const cachePromise = getCacheFromStorage();

    const cacheSizeSpan = document.getElementById("cache-size");
    const expiredCacheSizeSpan = document.getElementById("expired-cache-size");

    const cache = await cachePromise;

    if (cacheSizeSpan) {
        cacheSizeSpan.innerText = cache.length.toString()
    } else {
        console.error("Span 'cache-size' not found")
    }

    if (expiredCacheSizeSpan) {
        expiredCacheSizeSpan.innerText = cache.filter((e) => !isStillValid(e)).length.toString()
    } else {
        console.error("Span 'cache-size' not found")
    }

}

/**
 * Adds the click event to the 'clear cache' button.
 */
function addButtonClickEvent() {
    let clearCacheButton = document.getElementById("clear-cache-btn");
    if (clearCacheButton) {
        clearCacheButton.onclick = async (e) => {
            await upsertCache([]);
            displayCacheInfo().then(() => console.log("Set cache info"));
        };
    } else {
        console.error("Did not find clear-cache button");
    }

}


/**
 * Deletes a specific entry from the ignore-list and modifies the options-dom accordingly.
 * @param key The key of the entry to delete.
 * @param trashIcon The trash icon which was clicked by the user (will be removed from dom).
 * @param text The ignore-entry description shown to the user (will be crossed out).
 */
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


//
// PAGE LOAD
//
displayCacheInfo().then(() => console.log("Set cache info"));
showIgnored().then(() => console.log("Successfully added ignored options"));
addButtonClickEvent();