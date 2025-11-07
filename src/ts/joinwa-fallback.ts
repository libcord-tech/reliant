(() =>
{
    function addSwitcher(newSwitcher: Switcher): void
    {
        chrome.storage.local.get('switchers', (result) =>
        {
            let switchers: Switcher[] = [];
            if (typeof result.switchers !== 'undefined')
                switchers = result.switchers;
            if (!(switchers.some(switcher => switcher.name === newSwitcher.name))) {
                switchers.push(newSwitcher);
                chrome.storage.local.set({'switchers': switchers});
            }
        });
    }

    if (urlParameters['page'] === 'join_WA') {
        const switcherRegex: RegExp = new RegExp(`nation=([A-Za-z0-9_-]+)[?&]appid=([A-Za-z0-9_-]+)`, 'g');
        const match = switcherRegex.exec(document.URL);
        const newSwitcher: Switcher = {
            name: match[1],
            appid: match[2]
        };
        addSwitcher(newSwitcher);
    }
})();