(() =>
{
    async function addSwitcher(newSwitcher: Switcher): Promise<void>
    {
        const storedValue = await getStorageValue('switchers');
        const storedSwitchers: Switcher[] = Array.isArray(storedValue) ? storedValue : [];
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
            await setStorageValue('switchers', switchers);

        if (switchers.some((switcher) => canonicalize(switcher.name) === canonicalize(newSwitcher.name)))
            return;

        switchers.push({
            name: newSwitcher.name,
            appid: newSwitcher.appid,
            expiresAt: Date.now() + 28 * 24 * 60 * 60 * 1000,
        });
        await setStorageValue('switchers', switchers);
    }

    if (urlParameters['page'] === 'join_WA') {
        const switcherRegex: RegExp = new RegExp(`nation=([A-Za-z0-9_-]+)[?&]appid=([A-Za-z0-9_-]+)`, 'g');
        const match = switcherRegex.exec(document.URL);
        const newSwitcher: Switcher = {
            name: match[1],
            appid: match[2]
        };
        void addSwitcher(newSwitcher);
    }
})();
