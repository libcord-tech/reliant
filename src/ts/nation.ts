(async () =>
{
    await dieIfNoUserAgent();

    const nationTitle: HTMLDivElement = document.querySelector('.newtitlename');
    const crossButton: HTMLInputElement = document.createElement('input');
    crossButton.setAttribute('type', 'button');
    crossButton.setAttribute('value', 'Set Cross');
    crossButton.setAttribute('class', 'button');
    nationTitle.appendChild(crossButton);

    async function getNationEndorsements(nationName: string): Promise<string[]>
    {
        const regex = /^.+nation=(.+)$/g;
        return Array.from(document.querySelectorAll('.unbox .nlink'))
            .map((element) => (element as HTMLAnchorElement).href)
            .map((href) => href.match(regex)[0].replace(regex, '$1'));
    }

    async function setCrossClick(e: MouseEvent): Promise<void>
    {
        const nationName: string = urlParameters['nation'];
        let endorsingNations: string[] = await getNationEndorsements(nationName);
        endorsingNations.reverse();
        const sidePanel: HTMLDivElement = document.querySelector('#panel');
        const endorsementList: HTMLUListElement = document.createElement('ul');
        for (let i = 0; i !== endorsingNations.length; i++) {
            const listItem: HTMLLIElement = document.createElement('li');
            const endorseButton = document.createElement('input');
            endorseButton.setAttribute('type', 'button');
            endorseButton.setAttribute('class', 'ajaxbutton cross');
            endorseButton.setAttribute('value', `Endorse ${pretty(endorsingNations[i])}`);

            function onEndorseClick(e: MouseEvent): void
            {
                chrome.storage.local.get('localid', async (result) =>
                {
                    const localId = result.localid;
                    let formData = new FormData();
                    formData.set('nation', endorsingNations[i]);
                    formData.set('localid', localId);
                    formData.set('action', 'endorse');
                    await makeAjaxQuery('/cgi-bin/endorse.cgi', 'POST', formData);
                });
                (e.target as HTMLInputElement).parentElement.removeChild((e.target as HTMLInputElement));
            }

            endorseButton.addEventListener('click', onEndorseClick);
            listItem.appendChild(endorseButton);
            endorsementList.appendChild(listItem);
        }
        sidePanel.appendChild(endorsementList);
    }

    crossButton.addEventListener('click', setCrossClick);

    const nationName = canonicalize(document.querySelector('#content > div.lineundercover > div.newnonflagstuff > div.newtitlebox > div.newtitlename > a').textContent);
    console.log(nationName);
    // Replace add to dossier button
    // Remove it first
    const dossierButton: HTMLInputElement = document.querySelector('button[value=add]');
    if (!dossierButton) {
        return;
    }
    dossierButton.parentElement.removeChild(dossierButton);
    // Get tracked nations
    const trackedNations: string[] = await getStorageValue('trackednations') || [];
    // Add a new button
    const trackButton: HTMLInputElement = document.createElement('input');
    trackButton.setAttribute('type', 'button');
    trackButton.setAttribute('value', 'Track');
    trackButton.setAttribute('class', 'button');
    trackButton.setAttribute('id', 'reliant-track');
    const stopTrackingButton: HTMLInputElement = document.createElement('input');
    stopTrackingButton.setAttribute('type', 'button');
    stopTrackingButton.setAttribute('value', 'Stop Tracking');
    stopTrackingButton.setAttribute('class', 'button');
    // Add the button to the page
    async function buttonListener(e: MouseEvent): Promise<void>
    {
        // Fetch fresh tracked nations to avoid race conditions with multiple tabs
        const currentTrackedNations: string[] = await getStorageValue('trackednations') || [];
        
        if ((e.target as HTMLInputElement).value === 'Track') {
            if (!currentTrackedNations.includes(nationName)) {
                currentTrackedNations.push(nationName);
                await setStorageValue('trackednations', currentTrackedNations);
            }
            (e.target as HTMLInputElement).value = 'Stop Tracking';
        } else {
            const index = currentTrackedNations.indexOf(nationName);
            if (index !== -1) {
                currentTrackedNations.splice(index, 1);
                await setStorageValue('trackednations', currentTrackedNations);
            }
            (e.target as HTMLInputElement).value = 'Track';
        }
    }
    stopTrackingButton.addEventListener('click', buttonListener);
    trackButton.addEventListener('click', buttonListener);

    if (trackedNations.includes(nationName)) {
        document.querySelector('#composebutton').parentElement.appendChild(stopTrackingButton);
    } else {
        document.querySelector('#composebutton').parentElement.appendChild(trackButton);
    }
})();