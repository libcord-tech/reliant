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

    window.addEventListener('hashchange', () =>
    {
        let a: NodeList = document.querySelectorAll('a');
        for (let i = 0; i !== a.length; i++) {
            let link: string = (a[i] as HTMLAnchorElement).href;
            if (link.indexOf('join_WA') !== -1) {
                const switcherRegex: RegExp = new RegExp(`nation=([A-Za-z0-9_-]+)[?&]appid=([A-Za-z0-9_-]+)`, 'g');
                console.log(link);
                const match: string[] = switcherRegex.exec(link);
                const newSwitcher: Switcher = {
                    name: match[1],
                    appid: match[2]
                };
                addSwitcher(newSwitcher);
            }
        }
    });
})();