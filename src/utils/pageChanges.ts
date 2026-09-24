/**
 * Runs `task` now, and again whenever the page changes.
 *
 * Content scripts only run on full page loads, but github mostly navigates
 * client-side (Turbo, React), i.e., replaces parts of the dom without a reload.
 *
 * Runs of `task` never overlap; changes during a run lead to one more run afterwards.
 * As the dom changes frequently, `task` should return quickly if there is nothing to do.
 *
 * @param task the (idempotent) task to run
 * @returns a function to request an additional run of `task`
 */
export function runOnPageChanges(task: () => Promise<void>): () => void {
    let running = false;
    let runRequested = false;
    let scheduled: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
        if (running) {
            runRequested = true;
            return;
        }
        running = true;
        try {
            await task();
        } catch (e) {
            console.error("[licenseplate]", e);
        } finally {
            running = false;
        }
        if (runRequested) {
            runRequested = false;
            await run();
        }
    };

    const schedule = () => {
        if (scheduled === undefined) {
            scheduled = setTimeout(() => {
                scheduled = undefined;
                run();
            }, 200);
        }
    };

    // Observe the root element, as Turbo replaces the whole <body> when navigating
    new MutationObserver(schedule).observe(document.documentElement, {childList: true, subtree: true});
    run();
    return schedule;
}
