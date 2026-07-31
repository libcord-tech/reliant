(() =>
{
    async function getNumSwitchers(): Promise<number>
    {
        const result = await new Promise<{ switchers?: Switcher[] }>((resolve) =>
        {
            chrome.storage.local.get('switchers', resolve);
        });
        const storedSwitchers: Switcher[] = result.switchers ?? [];
        const now = Date.now();
        let migrated = false;
        const switchers = storedSwitchers
            .map((switcher) =>
            {
                if (switcher.expiresAt !== undefined)
                    return switcher;
                migrated = true;
                return { ...switcher, expiresAt: now + 28 * 24 * 60 * 60 * 1000 };
            })
            .filter((switcher) => switcher.expiresAt! > now);
        if (migrated || switchers.length !== storedSwitchers.length)
            await chrome.storage.local.set({ switchers });
        return switchers.length;
    }

    async function getCurrentWa(): Promise<string>
    {
        return new Promise((resolve) =>
        {
            chrome.storage.local.get('currentwa', (result) =>
            {
                if (result.currentwa)
                    resolve(result.currentwa);
                else
                    resolve('N/A');
            });
        });
    }

    async function init(): Promise<void>
    {
        const values = await Promise.all([getNumSwitchers(), getCurrentWa()]);
        document.querySelector('#switchers-left').innerHTML = String(values[0]);
        document.querySelector('#current-wa-nation').innerHTML = values[1];
    }

    init();
})();
