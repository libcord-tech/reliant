(async () =>
{
    /* Every button with class "ajaxbutton" indicates that the button makes a request to
     * the NS server. The "makeAjaxQuery" function will disable these buttons when a request
     * starts and will only be re-enabled once a complete response has been received from the
     * NS server in order to comply with rule "4. Avoid Simultaneous Requests".
     */
    const pageContent: string = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Reliant</title>
        <meta charset="utf-8">
    </head>
    <body>
        <div id="container">
            <div id="group-2">
                <!-- Switchers -->
                <div id="switchers-container">
                    <span class="header">Switchers Left</span>
                    <span class="information" id="num-switchers">0</span>
                </div>
                <div id="load-time-container">
                    <span class="subheader">Load Time</span>
                    <span class="information" id="load-time"></span>
                </div>
                <!-- Current WA Nation -->
                <div id="current-wa-nation-container">
                    <div class="buttonblock">
                        <input type="button" class="ajaxbutton" id="update-localid" value="Update Localid">
                        <input type="button" class="ajaxbutton" id="update-wa-status" value="Update">
                    </div>
                    <span id="current-wa-nation-header" class="header">Current WA Nation</span>
                    <div class="buttonblock">
                        <input type="button" id="resign" value="Resign" class="ajaxbutton">
                        <input type="button" id="admit" value="Admit on Next Switcher" class="ajaxbutton">
                    </div>
                    <span id="current-wa-nation" class="information">N/A</span>
                </div>
                <!-- Status -->
                <div id="status-container">
                    <span id="status-header" class="header">Status</span>
                    <span id="status" class="information">N/A</span>
                </div>
                <!-- Current Region -->
                <div id="current-region-container">
                    <span id="current-region-header" class="header">Current Region</span>
                    <span id="current-region" class="information">N/A</span>
                    <span class="subheader">WA Delegate</span>
                    <span class="information" id="wa-delegate">N/A</span>
                    <span class="subheader">Last WA Update</span>
                    <span class="information" id="last-wa-update">N/A</span>
                    <input type="button" class="ajaxbutton" id="update-region-status" value="Update">
                    <input type="button" class="ajaxbutton" id="check-current-region" value="Check Current Region">
                    <input type="hidden" id="delegate-nation" value="N/A">
                    <input type="button" class="ajaxbutton" id="endorse-delegate" value="Endorse Delegate">
                    <input type="button" id="copy-win" value="Copy Win">
                    <input type="button" id="copy-orders" value="Copy Orders">
                    <input type="button" id="open-region" value="Open">
                </div>
                <!-- Current Region Happenings -->
                <div id="current-region-happenings-container">
                    <span class="header">Region Happenings</span>
                    <ul class="information" id="region-happenings">
                    </ul>
                </div>
            </div>
            <div id="group-5">
                <!-- Chasing -->
                <div id="chasing-container">
                    <span id="chasing-header" class="header">Chasing</span>
                    <span class="subheader">JP</span>
                    <input type="button" id="move-to-jp" value="Move to JP" class="ajaxbutton">
                    <span class="subheader">Chase</span>
                    <input type="button" id="chasing-button" value="Refresh" class="ajaxbutton">
                    <span class="subheader occupation-mode-toggle">Occupation Mode</span>
                    <span class="information occupation-mode-toggle" id="occupation-status">Disabled</span>
                    <span class="subheader occupation-mode-toggle">Sequence</span>
                    <span class="information occupation-mode-toggle" id="occupation-sequence">Ready</span>
                </div>
                <!-- Reports Container -->
                <div id="reports-container">
                    <span class="header">Reports</span>
                    <label for="set-sse-timeout">Timeout (seconds)</label>
                    <input type="text" id="sse-timeout-value">
                    <input type="button" id="set-sse-timeout" value="Set">
                    (<span id="reports-time"></span>)
                    <ul id="reports" class="information">
                    </ul>
                </div>
            </div>
            <div id="group-3">
                <!-- Endorsing -->
                <div id="endorse-container">
                    <span id="endorse-header" class="header">Endorse</span>
                    <div class="buttonblock">
                        <input type="button" id="refresh-endorse" value="Refresh" class="ajaxbutton">
                    </div>
                    <ul class="information" id="nations-to-endorse">
                    </ul>
                </div>
                <!-- Dossier -->
                <div id="dossier-container">
                    <span id="dossier-header" class="header">Dossier</span>
                    <div class="buttonblock">
                        <input type="button" id="refresh-dossier" value="Refresh" class="ajaxbutton">
                        <label for="raider-jp">Raider Jump Point</label>
                        <input type="text" id="raider-jp">
                        <input type="button" id="set-raider-jp" value="Set">
                    </div>
                    <ul class="information" id="nations-to-dossier">
                    </ul>
                </div>
            </div>
            <div id="group-4">
                <!-- JP Happenings -->
                <div id="jp-happenings-container">
                    <span class="header">JP Happenings</span>
                    <ul class="information" id="jp-happenings">
                    </ul>
                </div>
                <!-- Raider Happenings -->
                <div id="raider-happenings-container">
                    <span class="header">Raider Happenings</span>
                    <ul class="information" id="raider-happenings">
                    </ul>
                </div>
            </div>
            <div id="group-6">
                <!-- Did I Update? -->
                <div id="did-i-update-container">
                    <span class="header">Did I Update?</span>
                    <input type="button" class="ajaxbutton" id="check-if-updated" value="Did I Update?">
                    <div class="information">
                        <ul id="did-i-update">
                        </ul>
                    </div>
                </div>
                <!-- World Happenings-->
                <div id="world-happenings-container">
                    <span class="header" id="world-happenings-header">World Happenings</span>
                    <input type="button" class="ajaxbutton" id="update-world-happenings" value="Update">
                    <ul class="information" id="world-happenings">
                    </ul>
                </div>
            </div>
        </div>
    </body>
</html>
`;

    // Initiate SSE connection
    const raiderJp = await getStorageValue('raiderjp');
    // const eventSource = new EventSource(`/api/move+member+endo+region:${raiderJp}`);

    // Types for our event data
    interface EventData {
        time: string;
        id: string;
        str: string;
    }

// Interface for our event patterns
    interface EventPattern {
        regex: RegExp;
        format: (matches: RegExpMatchArray) => string;
        // Add optional handler for additional processing
        handler?: (matches: RegExpMatchArray) => void;
    }

// Event patterns configuration
    const eventPatterns: Record<string, EventPattern> = {
        RELOCATION: {
            regex: /@@([^@]+)@@ relocated from %%([^%]+)%% to %%([^%]+)%%/,
            format: (matches) => formatLink(matches[1], 'nation') +
                ` moved from ${formatLink(matches[2], 'region')} to ${formatLink(matches[3], 'region')}`,
            handler: (matches) => {
                // (document.querySelector('#chasing-button') as HTMLInputElement).setAttribute('data-moveregion', matches[3]);
            }
        },
        ADMISSION: {
            regex: /@@([^@]+)@@ was admitted to the World Assembly/,
            format: (matches) => `${formatLink(matches[1], 'nation')} was admitted to the World Assembly`
        },
        ENDORSEMENT: {
            regex: /@@([^@]+)@@ endorsed @@([^@]+)@@/,
            format: (matches) => `${formatLink(matches[1], 'nation')} endorsed ${formatLink(matches[2], 'nation')}`
        },
        WITHDRAW_ENDORSEMENT: {
            regex: /@@([^@]+)@@ withdrew its endorsement from @@([^@]+)@@/,
            format: (matches) => `${formatLink(matches[1], 'nation')} withdrew its endorsement from ${formatLink(matches[2], 'nation')}`
        },
        RESIGN_WA: {
            regex: /@@([^@]+)@@ resigned from the World Assembly/,
            format: (matches) => `${formatLink(matches[1], 'nation')} resigned from the World Assembly`
        },
        INFLUENCE: {
            regex: /@@([^@]+)@@'s influence in %%([^@]+)%% rose from "[^@]+" to "[^@]+"/,
            format: (matches) => `${formatLink(matches[1], 'nation')} updated in ${formatLink(matches[2], 'region')}`
        },
        WA_DELEGATE: {
            regex: /@@([^@]+)@@ became WA Delegate of %%([^%]+)%%/,
            format: (matches) => `${formatLink(matches[1], 'nation')} became WA Delegate of ${formatLink(matches[2], 'region')}`
        }
    };

// Helper function to create links
    const formatLink = (text: string, type: 'nation' | 'region'): string => {
        return `<a href="/${type}=${text}">${text}</a>`;
    };

// Helper function to append report
    const appendReport = (content: string): HTMLLIElement => {
        const reportsElement = document.querySelector('#reports');
        if (reportsElement) {
            const liElement = document.createElement('li');
            liElement.innerHTML = content;
            reportsElement.prepend(liElement);
            return liElement;
        }
    };

// Main event handler
    const handleEventMessage = async (event: MessageEvent): Promise<void> => {
        try {
            const data = JSON.parse(event.data) as EventData;

            // Try each pattern until we find a match
            for (const pattern of Object.values(eventPatterns)) {
                const match = data.str.match(pattern.regex);
                if (match) {
                    const reportElement = appendReport(pattern.format(match));
                    // Move region handler
                    if (pattern.handler) {
                        pattern.handler(match);
                    }
                    const sseTimeout = Number(await getStorageValue('ssetimeout')) * 1000;
                    if (sseTimeout) {
                        setTimeout(() => {
                            document.querySelector('#reports').removeChild(reportElement);
                        }, sseTimeout);
                    } else {
                        // Arbitrary default timeout
                        setTimeout(() => {
                            document.querySelector('#reports').removeChild(reportElement);
                        }, 10000);
                    }
                    return;
                }
            }

            // Log unmatched patterns for debugging
            console.log('Unmatched event:', data.str);
        } catch (error) {
            console.error('Error processing event:', error);
        }
    };

    // Set up event source
    let eventSource: EventSource;
    if (typeof EventSource !== 'undefined') {
        const myNation = await getStorageValue('currentwa');
        let url = `/api/nation:${myNation}+`;
        // nation:{nation} for each nation
        const newTrackedNations: string[] = await getStorageValue('trackednations') || [];
        if (newTrackedNations.length > 0) {
            url += newTrackedNations.map((nation) => `nation:${nation}`).join('+');
        } else {
            // lol
            url += `nation:haku`;
        }
        eventSource = new EventSource(url);
        eventSource.onmessage = handleEventMessage;
        console.log(`New SSE url: ${url}`);
    } else {
        console.error('EventSource is not supported in this browser');
    }

    eventSource.onopen = () => {
        console.log('SSE connection opened');
    }

    eventSource.onerror = () => {
        console.error('SSE connection error');
    }

    document.open();
    document.write(pageContent);
    document.close();

    await dieIfNoUserAgent();

    let notyf = new Notyf({
        duration: 3000,
        position: {
            x: 'right',
            y: 'top'
        }
    });

    /*
     * Dynamic Information
     */

    const status: HTMLSpanElement = document.querySelector('#status');
    const currentWANation: HTMLSpanElement = document.querySelector('#current-wa-nation');
    const nationsToEndorse: HTMLUListElement = document.querySelector('#nations-to-endorse');
    const nationsToDossier: HTMLUListElement = document.querySelector('#nations-to-dossier');
    const currentRegion: HTMLSpanElement = document.querySelector('#current-region');
    const didIUpdate: HTMLUListElement = document.querySelector('#did-i-update');
    const reports: HTMLUListElement = document.querySelector('#reports');
    const regionHappenings: HTMLUListElement = document.querySelector('#region-happenings');
    const worldHappenings: HTMLUListElement = document.querySelector('#world-happenings');
    const reportsTime: HTMLSpanElement = document.querySelector('#reports-time');

    /*
     * Things to keep track of
     */

    let nationsTracked: string[] = await getStorageValue('trackednations') || [];
    let nationsEndorsed: string[] = [];
    let moveCounts: object = {};

    /*
     * Helpers
     */

    async function manualLocalIdUpdate(e: MouseEvent): Promise<void>
    {
        freshlyAdmitted = false;
        console.log('manually updating localid');
        let response = await makeAjaxQuery('/region=rwby', 'GET');
        getLocalId(response);
        status.innerHTML = 'Updated localid.';
        // reset buttons
        (document.querySelector('#move-to-jp') as HTMLInputElement).value = 'Move to JP';
        (document.querySelector('#chasing-button') as HTMLInputElement).value = 'Refresh';
    }

    async function manualChkUpdate(e: MouseEvent): Promise<void>
    {
        let response = await makeAjaxQuery('/page=un', 'GET');
        getChk(response);
        // while we're getting the chk, we may as well check the current nation too
        let nationNameRegex = new RegExp('data-nname="([A-Za-z0-9_-]+?)">');
        await setStorageValue('currentwa', nationNameRegex.exec(response)[1]);
    }

    /*
     * Event Handlers
     */

    function resignWA(e: MouseEvent): void
    {
        chrome.storage.local.get('chk', async (result) =>
        {
            const currentWa = await getStorageValue('currentwa');
            const chk = result.chk;
            let formData = new FormData();
            formData.set('action', 'leave_UN');
            formData.set('chk', chk);
            const response = await makeAjaxQuery('/page=UN_status', 'POST', formData);
            if (response.indexOf('You inform the World Assembly that') !== -1) {
                freshlyAdmitted = false;
                status.innerHTML = `Resigned from the WA on ${currentWa}.`;
                await setStorageValue('currentwa', '');
                nationsTracked = [];
                await setStorageValue('trackednations', []);
            }
        });
    }

    function admitWA(e: MouseEvent): void
    {
        chrome.storage.local.get('switchers', async (result) =>
        {
            // storedswitchers is a list of nation, appid objects
            (document.querySelector('#chasing-button') as HTMLInputElement).value = 'Refresh';
            (document.querySelector('#move-to-jp') as HTMLInputElement).value = 'Move to JP';
            currentRegion.innerHTML = 'N/A';
            document.querySelector('#wa-delegate').innerHTML = 'N/A';
            document.querySelector('#last-wa-update').innerHTML = 'N/A';
            nationsToEndorse.innerHTML = '';
            nationsToDossier.innerHTML = '';
            nationsEndorsed = [];

            let storedSwitchers: Switcher[] = result.switchers;
            if (typeof storedSwitchers === 'undefined')
                status.innerHTML = 'No switchers stored.';
            let formData = new FormData();
            formData.set('nation', storedSwitchers[0].name);
            formData.set('appid', storedSwitchers[0].appid);
            let response = await makeAjaxQuery('/cgi-bin/join_un.cgi', 'POST', formData, true);
            if (response.indexOf('Welcome to the World Assembly, new member') !== -1) {
                freshlyAdmitted = true;
                status.innerHTML = `Admitted to the WA on ${storedSwitchers[0].name}.`;
                await chrome.storage.local.set({'currentwa': storedSwitchers[0].name});
                nationsTracked = [];
                await chrome.storage.local.set({ trackednations: [] });
                getChk(response);
                storedSwitchers.shift();
            }
            else if (response.indexOf('Another WA member nation is currently using the same email address') !== -1)
                status.innerHTML = `Error admitting to the WA on ${storedSwitchers[0].name} (nation already in WA).`;
            else {
                status.innerHTML = `Error admitting to the WA on ${storedSwitchers[0].name} (invalid application).`;
                storedSwitchers.shift();
            }
            chrome.storage.local.set({'switchers': storedSwitchers});
        });
    }

    function refreshEndorse(e: MouseEvent): void
    {
        const clickedButton = e.target as HTMLInputElement;
        const jpHappenings = document.querySelector('#jp-happenings');
        nationsToEndorse.innerHTML = '';
        jpHappenings.innerHTML = '';
        chrome.storage.local.get(['jumppoint', 'endorsehappeningscount', 'currentwa', 'endorsekeywords'], async (result) =>
        {
            let endorseKeywords: string[] = [];
            if (result.endorsekeywords)
                endorseKeywords = result.endorsekeywords;
            const maxHappeningsCount = Number(result.endorsehappeningscount) || 10;
            const jumpPoint = result.jumppoint || 'artificial_solar_system';

            const apiResponse = await fetchWithRateLimit(`/cgi-bin/api.cgi?q=happenings;view=region.${jumpPoint};filter=move+member+endo`, {}, clickedButton);
            const apiText = await apiResponse.text();
            const happeningsObject = parseApiHappenings(apiText);
            const happeningsText = happeningsObject.text;
            const happeningsTimeStamps = happeningsObject.timestamps;
            const nationNameRegex = new RegExp('@@([A-Za-z0-9_-]+)@@');

            let resigned: string[] = [];
            let happeningsAdded: number = 0;
            for (let i = 0; i != happeningsText.length; i++) {
                // update the jp happenings at the same time so we don't have to make an extra query
                if (happeningsAdded < maxHappeningsCount) {
                    jpHappenings.innerHTML += `<li>${timeAgo(happeningsTimeStamps[i])}: ${formatApiString(happeningsText[i])}</li>`;
                    happeningsAdded++;
                }
                const nationNameMatch = nationNameRegex.exec(happeningsText[i]);
                const nationName = nationNameMatch[1];

                // don't allow us to endorse ourself
                if (canonicalize(nationName) === canonicalize(result.currentwa))
                    resigned.push(nationName);
                // don't allow us to endorse the same nation more than once per switch
                if (nationsEndorsed.indexOf(nationName) !== -1)
                    resigned.push(nationName);
                // Don't include nations that probably aren't in the WA
                if (happeningsText[i].indexOf('resigned from') !== -1)
                    resigned.push(nationName);
                // Only include nations with keywords
                if (endorseKeywords.length &&
                    (endorseKeywords.every((keyword) => nationName.indexOf(keyword) === -1))) {
                    resigned.push(nationName);
                }
                else if (happeningsText[i].indexOf('was admitted') !== -1) {
                    if (resigned.indexOf(nationName) === -1) {
                        function onEndorseClick(e: MouseEvent)
                        {
                            chrome.storage.local.get('localid', async (localidresult) =>
                            {
                                if ((e.target as HTMLInputElement).getAttribute('data-updatedlocalid') === '1') {
                                    const localId = localidresult.localid;
                                    let formData = new FormData();
                                    formData.set('nation', nationName);
                                    formData.set('localid', localId);
                                    formData.set('action', 'endorse');
                                    let endorseResponse = await makeAjaxQuery('/cgi-bin/endorse.cgi', 'POST', formData);
                                    if (endorseResponse.indexOf('Failed security check.') !== -1) {
                                        status.innerHTML = `Failed to endorse ${nationName}.`;
                                        (e.target as HTMLInputElement).setAttribute('data-updatedlocalid', '0');
                                    }
                                    else if (endorseResponse.indexOf('Both nations must reside in the same region') !== -1) {
                                        status.innerHTML = `Failed to endorse ${nationName} (different region).`;
                                        (e.target as HTMLInputElement).setAttribute('data-clicked', '1');
                                        (e.target as HTMLInputElement).parentElement.removeChild(e.target as HTMLInputElement);
                                    }
                                    else {
                                        (e.target as HTMLInputElement).setAttribute('data-clicked', '1');
                                        status.innerHTML = `Endorsed ${nationName}.`;
                                        nationsEndorsed.push(nationName);
                                        (e.target as HTMLInputElement).parentElement.removeChild(e.target as HTMLInputElement);
                                    }
                                }
                                else {
                                    (document.querySelector('#update-localid') as HTMLInputElement).click();
                                    (e.target as HTMLInputElement).setAttribute('data-updatedlocalid', '1');
                                }
                            });
                        }

                        let endorseButton: Element = document.createElement('input');
                        endorseButton.setAttribute('type', 'button');
                        endorseButton.setAttribute('data-clicked', '0');
                        endorseButton.setAttribute('class', 'ajaxbutton endorse');
                        endorseButton.setAttribute('value', `Endorse ${pretty(nationName)}`);
                        endorseButton.setAttribute('data-endorsenation', nationName);
                        endorseButton.setAttribute('data-updatedlocalid', '1');
                        endorseButton.addEventListener('click', onEndorseClick);
                        let endorseLi = document.createElement('li');
                        endorseLi.appendChild(endorseButton);
                        nationsToEndorse.appendChild(endorseLi);
                    }
                }
            }
        });
    }

    let potentialNationsToTrack = new Set<string>();

    function refreshDossier(e: MouseEvent): void
    {
        const clickedButton = e.target as HTMLInputElement;
        const raiderHappenings = document.querySelector('#raider-happenings');
        raiderHappenings.innerHTML = '';
        nationsToDossier.innerHTML = '';
        potentialNationsToTrack.clear();
        chrome.storage.local.get(['raiderjp', 'dossierhappeningscount', 'dossierkeywords'], async (result) =>
        {
            let dossierKeywords: string[] = [];
            if (result.dossierkeywords)
                dossierKeywords = result.dossierkeywords;
            const maxHappeningsCount = Number(result.dossierhappeningscount) || 10;
            const raiderJp = result.raiderjp;

            const apiResponse = await fetchWithRateLimit(`/cgi-bin/api.cgi?q=happenings;view=region.${raiderJp};filter=move+member+endo`, {}, clickedButton);
            const apiText = await apiResponse.text();
            const happeningsResponse = parseApiHappenings(apiText);
            const happeningsText = happeningsResponse.text;
            const happeningsTimestamps = happeningsResponse.timestamps;
            const nationNameRegex = new RegExp('@@([A-Za-z0-9_-]+)@@');

            let resigned: string[] = [];
            let happeningsAdded: number = 0;
            for (let i = 0; i != happeningsText.length; i++) {
                // update the raider jp happenings at the same time so we don't have to make an extra query (max 10)
                if (happeningsAdded < maxHappeningsCount) {
                    raiderHappenings.innerHTML += `<li>${timeAgo(happeningsTimestamps[i])}: ${formatApiString(happeningsText[i])}</li>`;
                    happeningsAdded++;
                }
                const nationNameMatch = nationNameRegex.exec(happeningsText[i]);
                const nationName = nationNameMatch[1];
                // don't let us dossier the same nation twice
                if (nationsTracked.indexOf(nationName) !== -1)
                    resigned.push(nationName);
                // Don't include nations that probably aren't in the WA
                if (happeningsText[i].indexOf('resigned from') !== -1)
                    resigned.push(nationName);
                if (dossierKeywords.length &&
                    (dossierKeywords.every((keyword) => nationName.indexOf(keyword) === -1))) {
                    resigned.push(nationName);
                }
                else if (happeningsText[i].indexOf('was admitted') !== -1) {
                    if (resigned.indexOf(nationName) === -1) {
                        async function onDossierClick(e: MouseEvent): Promise<void>
                        {
                            (e.target as HTMLInputElement).setAttribute('data-clicked', '1');
                            status.innerHTML = `Tracking ${nationName}`;
                            nationsTracked.push(nationName);
                            (e.target as HTMLInputElement).parentElement.removeChild(e.target as HTMLInputElement);
                            await setStorageValue('trackednations', nationsTracked);
                        }

                        if (!potentialNationsToTrack.has(nationName)) {
                            let dossierButton = document.createElement('input');
                            dossierButton.setAttribute('type', 'button');
                            dossierButton.setAttribute('class', 'ajaxbutton dossier');
                            // so our key doesn't click it more than once
                            dossierButton.setAttribute('data-clicked', '0');
                            dossierButton.setAttribute('value', `Track ${pretty(nationName)}`);
                            dossierButton.addEventListener('click', onDossierClick);
                            let dossierLi = document.createElement('li');
                            dossierLi.appendChild(dossierButton);
                            nationsToDossier.appendChild(dossierLi);
                        }
                        potentialNationsToTrack.add(nationName);
                    }
                }
            }
        });
    }

    function setRaiderJP(e: MouseEvent): void
    {
        const newRaiderJP = canonicalize((document.querySelector('#raider-jp') as HTMLInputElement).value);
        chrome.storage.local.set({'raiderjp': newRaiderJP});
        notyf.success(`Set raider JP to ${newRaiderJP}`);
        (document.querySelector('#raider-jp') as HTMLInputElement).value = '';
    }

    function moveToJP(e: MouseEvent): void
    {
        if ((e.target as HTMLInputElement).value == 'Move to JP') {
            chrome.storage.local.get('localid', (localidresult) =>
            {
                chrome.storage.local.get('jumppoint', async (jumppointresult) =>
                {
                    const localId = localidresult.localid;
                    const moveRegion = jumppointresult.jumppoint;
                    let formData = new FormData();
                    formData.set('localid', localId);
                    formData.set('region_name', moveRegion);
                    formData.set('move_region', '1');
                    let response = await makeAjaxQuery('/page=change_region', 'POST', formData);
                    if (response.indexOf('This request failed a security check.') !== -1)
                        status.innerHTML = `Failed to move to ${moveRegion}.`;
                    else {
                        status.innerHTML = `Moved to ${moveRegion}`;
                        currentRegion.innerHTML = moveRegion;
                    }
                    (e.target as HTMLInputElement).value = 'Update Localid';
                });
            });
        }
        else if ((e.target as HTMLInputElement).value == 'Update Localid') {
            manualLocalIdUpdate(e);
            (e.target as HTMLInputElement).value = 'Move to JP';
        }
    }

    function getMovedToRegion(): string | null {
        const ulElement = document.querySelector<HTMLUListElement>('#reports');
        if (!ulElement) {
            return null;
        }

        // 2. Find the first LI containing "moved from".
        const targetLi = Array.from(ulElement.querySelectorAll<HTMLLIElement>('li'))
            .find(li => li.textContent?.includes('moved from'));

        if (!targetLi) {
            return null; // No matching LI found
        }

        // 3. Inside this <li>, there are three <a> tags in the example:
        //    [0] => The nation link (e.g. "/nation=oathaastealre")
        //    [1] => The "moved from" region link (e.g. "/region=look_away")
        //    [2] => The "moved to" region link (e.g. "/region=kaisereich")
        const anchors = targetLi.querySelectorAll<HTMLAnchorElement>('a');

        // Make sure we have at least 3 <a> tags
        if (anchors.length < 3) {
            return null; // Not enough anchors to match the pattern
        }

        // Ignore our own nation
        const movedFromNation = anchors[0].textContent?.trim() ?? null;
        const myNation = document.querySelector('#current-wa-nation')?.textContent?.trim() ?? null;
        if (movedFromNation === myNation) {
            return null; // Ignore our own nation
        }

        // The "moved to" region should be anchors[2]
        const movedToRegion = anchors[2].textContent?.trim() ?? null;

        return movedToRegion;
    }

    async function updateOccupationSequence(newSequence: string): Promise<void>
    {
        await setStorageValue('occupationsequence', newSequence);
        document.querySelector('#occupation-sequence').innerHTML = newSequence;
    }

    async function performOccupationSequence(): Promise<void>
    {
        const occupationSequence = await getStorageValue('occupationsequence') || 'ready';
        
        switch (occupationSequence) {
            case 'ready':
                // Start with chasing
                await performChaseAction();
                break;
            case 'awaiting-localid':
                // User pressed key again, update localid
                await performLocalIdUpdate();
                break;
            case 'awaiting-region':
                // User pressed key again, update region status
                await performRegionUpdate();
                break;
            case 'awaiting-endorsement':
                // User pressed key again, endorse delegate
                await performEndorsement();
                break;
        }
    }

    async function performChaseAction(): Promise<void>
    {
        const doNotMove: string[] = await getStorageValue('blockedregions') || [];
        const moveRegion = getMovedToRegion();
        
        if (moveRegion) {
            if (doNotMove.indexOf(canonicalize(moveRegion)) !== -1) {
                status.innerHTML = `Blocked region: ${moveRegion}. Sequence stopped.`;
                await updateOccupationSequence('ready');
                return;
            }
            
            chrome.storage.local.get('localid', async (result) =>
            {
                const localId = result.localid;
                const formData = new FormData();
                formData.set('localid', localId);
                formData.set('region_name', moveRegion);
                formData.set('move_region', '1');
                let response = await makeAjaxQuery('/page=change_region', 'POST', formData);
                if (response.indexOf('This request failed a security check.') !== -1) {
                    status.innerHTML = `Failed to move to ${moveRegion}. Sequence stopped.`;
                    await updateOccupationSequence('ready');
                }
                else {
                    status.innerHTML = `Moved to ${moveRegion}. Press move key to update localid.`;
                    currentRegion.innerHTML = moveRegion;
                    document.querySelector('#wa-delegate').innerHTML = 'N/A';
                    document.querySelector('#last-wa-update').innerHTML = 'N/A';
                    // Wait for next keypress
                    await updateOccupationSequence('awaiting-localid');
                }
            });
        } else {
            status.innerHTML = 'No movement detected. Sequence stopped.';
            await updateOccupationSequence('ready');
        }
    }

    async function performLocalIdUpdate(): Promise<void>
    {
        let response = await makeAjaxQuery('/region=rwby', 'GET');
        getLocalId(response);
        status.innerHTML = 'Updated localid. Press move key to update region status.';
        // Wait for next keypress
        await updateOccupationSequence('awaiting-region');
    }

    async function performRegionUpdate(): Promise<void>
    {
        await updateRegionStatus({ target: null } as MouseEvent);
        status.innerHTML = 'Updated region status. Press move key to endorse delegate.';
        // Wait for next keypress
        await updateOccupationSequence('awaiting-endorsement');
    }

    async function performEndorsement(): Promise<void>
    {
        await endorseDelegate({ target: null } as MouseEvent);
        status.innerHTML = 'Occupation sequence completed.';
        // Reset sequence to ready
        await updateOccupationSequence('ready');
    }

    async function chasingButton(e: MouseEvent): Promise<void>
    {
        const occupationMode = await getStorageValue('occupationmode') || false;
        
        if (occupationMode) {
            // In occupation mode, use the sequence logic
            await performOccupationSequence();
            return;
        }
        
        // Original chasing logic for non-occupation mode
        const doNotMove: string[] = await new Promise((resolve, reject) =>
        {
            chrome.storage.local.get('blockedregions', (result) =>
            {
                if (typeof result.blockedregions !== 'undefined')
                    resolve(result.blockedregions);
                else
                    resolve([]);
            });
        });
        
        const moveRegion = getMovedToRegion();
        if ((e.target as HTMLInputElement).value == 'Update Localid') {
            await manualLocalIdUpdate(e);
            (e.target as HTMLInputElement).value = 'Refresh';
        }
        else if (moveRegion) {
            chrome.storage.local.get('localid', async (result) =>
            {
                const localId = result.localid;
                const formData = new FormData();
                formData.set('localid', localId);
                formData.set('region_name', moveRegion);
                if (doNotMove.indexOf(canonicalize(moveRegion)) !== -1) {
                    return;
                }
                formData.set('move_region', '1');
                let response = await makeAjaxQuery('/page=change_region', 'POST', formData);
                if (response.indexOf('This request failed a security check.') !== -1)
                    status.innerHTML = `Failed to move to ${moveRegion}.`;
                else {
                    status.innerHTML = `Moved to ${moveRegion}`;
                    currentRegion.innerHTML = moveRegion;
                }
                (e.target as HTMLInputElement).value = 'Update Localid';
                (e.target as HTMLInputElement).setAttribute('data-moveregion', '');
                document.querySelector('#wa-delegate').innerHTML = 'N/A';
                document.querySelector('#last-wa-update').innerHTML = 'N/A';
            });
        }
    }
    /*async function chasingButton(e: MouseEvent): Promise<void>
    {
        // jump points and such
        const doNotMove: string[] = await new Promise((resolve, reject) =>
        {
            chrome.storage.local.get('blockedregions', (result) =>
            {
                if (typeof result.blockedregions !== 'undefined')
                    resolve(result.blockedregions);
                else
                    resolve([]);
            });
        });
        if ((e.target as HTMLInputElement).value == 'Refresh') {
            let response = await makeAjaxQuery('/template-overall=none/page=reports', 'GET');
            // only so we can use queryselector on the response DOM rather than using regex matching
            let responseDiv = document.createElement('div');
            responseDiv.innerHTML = response;
            let lis = responseDiv.querySelectorAll('li');
            reportsTime.innerHTML = (responseDiv.querySelector('input[name=report_hours]') as HTMLInputElement)
                .value;
            // add the reports items to the page so we don't have to make a second query for it
            reports.innerHTML = '';
            const maxReportsCount: number = await new Promise((resolve, reject) =>
            {
                chrome.storage.local.get('reportscount', (result) =>
                {
                    resolve(parseInt(result.reportscount));
                });
            }) || 10;
            let reportsAdded: number = 0;
            for (let i = 0; i !== lis.length; i++) {
                if (reportsAdded === maxReportsCount)
                    break;
                let liAnchors = lis[i].querySelectorAll('a');
                let images = lis[i].querySelectorAll('img');
                // fix link
                for (let j = 0; j != liAnchors.length; j++)
                    liAnchors[j].href = liAnchors[j].href.replace('page=blank/', '');
                // make images smaller
                for (let j = 0; j != images.length; j++) {
                    images[j].width = 12;
                    images[j].height = 12;
                }
                reports.innerHTML += `<li>${lis[i].innerHTML}</li>`;
                reportsAdded++;
            }
            let moveRegion = responseDiv.querySelector('.rlink:nth-of-type(3)');
            if (!moveRegion)
                return;
            let moveRegionValue = canonicalize(moveRegion.innerHTML);
            if (doNotMove.indexOf(moveRegionValue) !== -1)
                return;
            // don't allow us to move to the same region
            if (moveRegionValue === currentRegion.innerHTML)
                return;
            let moveRegionParent = moveRegion.parentElement;
            let movingNation: string = canonicalize(moveRegionParent.querySelector('.nnameblock').innerHTML);
            if (moveRegionParent.innerHTML.indexOf('relocated from') === -1)
                return;
            if (typeof moveCounts[moveRegionValue] === 'undefined')
                moveCounts[moveRegionValue] = [movingNation];
            else if (moveCounts[moveRegionValue].indexOf(movingNation) === -1)
                moveCounts[moveRegionValue].push(movingNation);
            (e.target as HTMLInputElement).value = `Move!`;
            (e.target as HTMLInputElement).setAttribute('data-moveregion', moveRegionValue);
        }
        else if ((e.target as HTMLInputElement).getAttribute('data-moveregion')) {
            chrome.storage.local.get('localid', async (result) =>
            {
                const localId = result.localid;
                const moveRegion = (e.target as HTMLInputElement).getAttribute('data-moveregion');
                let formData = new FormData();
                formData.set('localid', localId);
                formData.set('region_name', moveRegion);
                formData.set('move_region', '1');
                let response = await makeAjaxQuery('/page=change_region', 'POST', formData);
                if (response.indexOf('This request failed a security check.') !== -1)
                    status.innerHTML = `Failed to move to ${moveRegion}.`;
                else {
                    status.innerHTML = `Moved to ${moveRegion}`;
                    currentRegion.innerHTML = moveRegion;
                }
                (e.target as HTMLInputElement).value = 'Update Localid';
                (e.target as HTMLInputElement).setAttribute('data-moveregion', '');
                document.querySelector('#wa-delegate').innerHTML = 'N/A';
                document.querySelector('#last-wa-update').innerHTML = 'N/A';
            });
        }
        else if ((e.target as HTMLInputElement).value == 'Update Localid') {
            manualLocalIdUpdate(e);
            (e.target as HTMLInputElement).value = 'Refresh';
        }
    }*/

    async function updateRegionStatus(e: MouseEvent): Promise<void>
    {
        if (currentRegion.innerHTML == 'N/A')
            return;
        
        // Use the API to fetch region data
        const regionName = currentRegion.innerHTML;
        const response = await fetchWithRateLimit(`/cgi-bin/api.cgi?region=${regionName}&q=happenings+delegate+lastupdate`, {}, e?.target as HTMLInputElement);
        const responseText = await response.text();
        
        // Parse the XML response
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseText, "application/xml");
        
        // Get delegate information
        const delegateElement = xmlDoc.querySelector('DELEGATE');
        const lastUpdateElement = xmlDoc.querySelector('LASTUPDATE');
        
        if (delegateElement && delegateElement.textContent) {
            const delegateName = delegateElement.textContent;
            // Format delegate display similar to the original HTML version
            document.querySelector('#wa-delegate').innerHTML = `<span class="nname">${delegateName}</span>`;
            (document.querySelector('#delegate-nation') as HTMLInputElement).value = delegateName;
        } else {
            document.querySelector('#wa-delegate').innerHTML = 'None.';
            (document.querySelector('#delegate-nation') as HTMLInputElement).value = 'N/A';
        }
        
        // Update last WA update time
        if (lastUpdateElement && lastUpdateElement.textContent) {
            const lastUpdateTimestamp = Number(lastUpdateElement.textContent);
            const lastUpdateTime = timeAgo(lastUpdateTimestamp);
            document.querySelector('#last-wa-update').innerHTML = lastUpdateTime;
        } else {
            document.querySelector('#last-wa-update').innerHTML = 'N/A';
        }
        
        // Update region happenings
        chrome.storage.local.get('regionhappeningscount', (result) =>
        {
            let regionHappeningsCount: number = Number(result.regionhappeningscount) || 10;
            regionHappenings.innerHTML = '';
            
            // Parse happenings from the API response
            const happeningsData = parseApiHappenings(responseText);
            const happeningsText = happeningsData.text;
            const happeningsTimestamps = happeningsData.timestamps;
            
            // Display happenings up to the configured count
            for (let i = 0; i < Math.min(regionHappeningsCount, happeningsText.length); i++) {
                const formattedText = formatApiString(happeningsText[i]);
                const timeString = timeAgo(happeningsTimestamps[i]);
                regionHappenings.innerHTML += `<li>${timeString}: ${formattedText}</li>`;
            }
        });
    }

    async function checkCurrentRegion(e: MouseEvent): Promise<void>
    {
        let response = await makeAjaxQuery('/region=artificial_solar_system', 'GET');
        let responseElement = document.createRange().createContextualFragment(response);
        let regionHref = (responseElement.querySelector('#panelregionbar > a') as HTMLAnchorElement).href;
        currentRegion.innerHTML = new RegExp('region=([A-Za-z0-9_]+)').exec(regionHref)[1];
    }

    async function endorseDelegate(e: MouseEvent): Promise<void>
    {
        chrome.storage.local.get('localid', async (localidresult) =>
        {
            const nationName = (document.querySelector('#delegate-nation') as HTMLInputElement).value;
            if (nationName === 'N/A')
                return;
            const localId = localidresult.localid;
            let formData = new FormData();
            formData.set('nation', nationName);
            formData.set('localid', localId);
            formData.set('action', 'endorse');
            let endorseResponse = await makeAjaxQuery('/cgi-bin/endorse.cgi', 'POST', formData);
            if (endorseResponse.indexOf('Failed security check.') !== -1)
                status.innerHTML = `Failed to endorse ${nationName}.`;
            else
                status.innerHTML = `Endorsed ${nationName}.`;
        });
    }

    async function checkIfUpdated(e: MouseEvent): Promise<void>
    {
        const clickedButton = e.target as HTMLInputElement;
        didIUpdate.innerHTML = '';
        const response = await fetchWithRateLimit(`/cgi-bin/api.cgi?q=happenings;view=nation.${currentWANation.innerHTML};filter=change`, {}, clickedButton);
        const xml = await response.text();
        const happeningsObject = await parseApiHappenings(xml);
        const happeningsText = happeningsObject.text;
        const happeningsTimestamps = happeningsObject.timestamps;

        // limit to max 5 happenings to save space
        for (let i = 0; i != 3; i++) {
            if (typeof happeningsText[i] === 'undefined')
                break;
            else {
                didIUpdate.innerHTML += `<li>${timeAgo(happeningsTimestamps[i])}: ${formatApiString(happeningsText[i])}</li>`;
            }
        }
    }

    async function updateWorldHappenings(e: MouseEvent): Promise<void>
    {
        const clickedButton = e.target as HTMLInputElement;
        worldHappenings.innerHTML = '';
        const response = await fetchWithRateLimit('/cgi-bin/api.cgi?q=happenings;filter=move+member+endo', {}, clickedButton);
        const responseText = await response.text();
        const happeningsResponse = parseApiHappenings(responseText);
        const happeningsText = happeningsResponse.text;
        const happeningsTimestamps = happeningsResponse.timestamps;

        // max 10
        chrome.storage.local.get('worldhappeningscount', (result) =>
        {
            let maxHappeningsCount = Number(result.worldhappeningscount) || 10;
            for (let i = 0; i < maxHappeningsCount; i++) {
                worldHappenings.innerHTML += `<li>${timeAgo(happeningsTimestamps[i])}: ${formatApiString(happeningsText[i])}</li>`;
            }
        });
    }

    function copyWin(e: MouseEvent): void
    {
        // https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
        let copyText = document.createElement('textarea');
        copyText.value = `W: https://www.nationstates.net/region=${currentRegion.innerHTML}`;
        document.body.appendChild(copyText);
        copyText.select();
        document.execCommand('copy');
        document.body.removeChild(copyText);
    }

    function copyOrders(e: MouseEvent): void
    {
        // https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
        let copyText = document.createElement('textarea');
        const delegateNation: string = (document.querySelector('#delegate-nation') as HTMLInputElement).value;
        if (document.querySelector('#last-wa-update').innerHTML.indexOf('hour') === -1)
            return;
        else if (delegateNation.indexOf('N/A') !== -1)
            return;
        copyText.value =
            `@here **NOW**\nMove to: https://www.nationstates.net/region=${currentRegion.innerHTML}\nThen endorse: https://www.nationstates.net/nation=${canonicalize(delegateNation)}`;
        document.body.appendChild(copyText);
        copyText.select();
        document.execCommand('copy');
        document.body.removeChild(copyText);
    }

    function openRegion(e: MouseEvent): void
    {
        const regionUrl = document.querySelector('#current-region').innerHTML;
        window.open(`/region=${regionUrl}`);
    }

    // Update the list of switchers as soon as a new WA admit page is opened
    // also update the EventSource whenever tracked nation changes
    function onStorageChange(changes: object): void
    {
        for (let key in changes) {
            let storageChange = changes[key];
            if (key === 'switchers') {
                const newSwitchers: Switcher[] = storageChange.newValue;
                (document.querySelector('#num-switchers') as HTMLSpanElement).innerHTML = String(newSwitchers.length);
            }
            else if (key === 'currentwa')
                currentWANation.innerHTML = storageChange.newValue || 'N/A';
            else if (key === 'occupationmode') {
                const occupationStatus = document.querySelector('#occupation-status');
                occupationStatus.innerHTML = storageChange.newValue ? 'Enabled' : 'Disabled';
            }
            else if (key === 'occupationsequence') {
                const occupationSequence = document.querySelector('#occupation-sequence');
                occupationSequence.innerHTML = storageChange.newValue;
            }
            else if (key === 'trackednations') {
                const myNation = document.querySelector('#current-wa-nation').innerHTML;
                eventSource.close();
                let url = `/api/nation:${myNation}+`;
                // nation:{nation} for each nation
                const newTrackedNations: string[] = storageChange.newValue;
                if (newTrackedNations.length > 0) {
                    url += newTrackedNations.map((nation) => `nation:${nation}`).join('+');
                    eventSource = new EventSource(url);
                    eventSource.onmessage = handleEventMessage;
                    console.log(`New SSE url: ${url}`);
                } else {
                    // lol
                    url += `nation:haku`;
                    eventSource = new EventSource(url);
                    eventSource.onmessage = handleEventMessage;
                    console.log(`New SSE url: ${url}`);
                }
            }
        }
    }

    /*
     * Event Listeners
     */

    document.querySelector('#resign').addEventListener('click', resignWA);
    document.querySelector('#admit').addEventListener('click', admitWA);
    document.querySelector('#refresh-endorse').addEventListener('click', refreshEndorse);
    document.querySelector('#refresh-dossier').addEventListener('click', refreshDossier);
    document.querySelector('#set-raider-jp').addEventListener('click', setRaiderJP);
    document.querySelector('#move-to-jp').addEventListener('click', moveToJP);
    document.querySelector('#chasing-button').addEventListener('click', chasingButton);
    document.querySelector('#update-localid').addEventListener('click', manualLocalIdUpdate);
    document.querySelector('#update-wa-status').addEventListener('click', manualChkUpdate);
    document.querySelector('#update-region-status').addEventListener('click', updateRegionStatus);
    document.querySelector('#check-current-region').addEventListener('click', checkCurrentRegion);
    document.querySelector('#check-if-updated').addEventListener('click', checkIfUpdated);
    document.querySelector('#copy-win').addEventListener('click', copyWin);
    document.querySelector('#endorse-delegate').addEventListener('click', endorseDelegate);
    document.querySelector('#update-world-happenings').addEventListener('click', updateWorldHappenings);
    document.querySelector('#open-region').addEventListener('click', openRegion);
    document.querySelector('#copy-orders').addEventListener('click', copyOrders);
    document.querySelector('#set-sse-timeout').addEventListener('click', async () =>
    {
        const timeoutValue: number = Number((document.querySelector('#sse-timeout-value') as HTMLInputElement).value);
        if (timeoutValue) {
            await setStorageValue('ssetimeout', timeoutValue);
            notyf.success(`Set SSE timeout to ${timeoutValue} seconds`);
        }
    });
    document.addEventListener('keyup', keyPress);
    chrome.storage.onChanged.addListener(onStorageChange);

    /*
     * Initialization
     */

    chrome.storage.local.get(['switchers', 'currentwa', 'occupationmode', 'occupationsequence'], (result) =>
    {
        try {
            document.querySelector('#num-switchers').innerHTML = result.switchers.length as string;
        } catch(e) {
            // no wa links in storage, do nothing
            if (e instanceof TypeError) {}
        }

        currentWANation.innerHTML = result.currentwa || 'N/A';
        
        const occupationStatus = document.querySelector('#occupation-status');
        const occupationSequence = document.querySelector('#occupation-sequence');
        occupationStatus.innerHTML = result.occupationmode ? 'Enabled' : 'Disabled';
        occupationSequence.innerHTML = result.occupationsequence || 'Ready';

        if (!(result.occupationmode)) {
            document.querySelectorAll('.occupation-mode-toggle').forEach((element) =>
            {
                element.classList.add('hidden');
            });
        }
    });
})();
