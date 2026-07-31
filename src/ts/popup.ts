(() =>
{
    async function getNumSwitchers(): Promise<number>
    {
        const result = await new Promise<{ switchers?: Switcher[] }>((resolve) =>
        {
            chrome.storage.local.get('switchers', resolve);
        });
        const storedSwitchers = Array.isArray(result.switchers) ? result.switchers : [];
        const now = Date.now();
        const switchers = storedSwitchers
            .filter((switcher) => switcher && typeof switcher.name === 'string' && typeof switcher.appid === 'string')
            .map((switcher) =>
            {
                const expiresAt = Number(switcher.expiresAt);
                return Number.isFinite(expiresAt) ? switcher :
                    { ...switcher, expiresAt: now + 28 * 24 * 60 * 60 * 1000 };
            })
            .filter((switcher) => Number(switcher.expiresAt) > now);
        if (JSON.stringify(switchers) !== JSON.stringify(storedSwitchers))
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
