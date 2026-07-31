(() =>
{
    async function addSwitcher(newSwitcher: Switcher): Promise<void>
    {
        const storedSwitchers: Switcher[] = await getStorageValue('switchers') ?? [];
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
