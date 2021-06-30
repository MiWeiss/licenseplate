import {getIgnoredFromSync, unIgnoreKey} from "./utils/ignoreUtils";
import {getCacheFromStorage, isStillValid, upsertCache} from "./utils/cacheUtils";

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
        if (allIgnored.length === 0) {
            ignored_repos_container.innerText = "No ignored repos";
            ignored_repos_container.classList.add("no-ignored-repos-message")
        }
    } else {
        console.error("no div with id 'ignored-repos' found");
    }
}


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