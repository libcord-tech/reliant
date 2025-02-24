const RELIANT_VERSION: string = chrome.runtime.getManifest().version;
let freshlyAdmitted: boolean = false;

/*
 * Types
 */

interface Switcher
{
    name: string;
    appid: string;
}

/*
 * Helpers
 */

function formatApiNation(nation: string): string
{
    let output = nation.replaceAll('@@', '');
    return `<a href='/nation=${output}'>${output}</a>`;
}

function formatApiRegion(region: string): string
{
    let output = region.replaceAll('%%', '');
    return `<a href='/region=${output}'>${output}</a>`;
}

function formatApiString(inputString: string): string {
    return inputString.replace(/(@@.*?@@|%%.*?%%)/g, (match) => {
        if (match.startsWith('@@')) {
            return formatApiNation(match);
        } else if (match.startsWith('%%')) {
            return formatApiRegion(match);
        }
        return match;
    });
}

function timeAgo(unixTimestamp: number): string {
    const now = Date.now();
    const providedTime = unixTimestamp * 1000; // Convert to milliseconds
    const difference = Math.floor((now - providedTime) / 1000); // Difference in seconds

    if (difference <= 59) {
        return 'Seconds ago';
    } else if (difference < 3600) {
        const minutes = Math.floor(difference / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
        const hours = Math.floor(difference / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
}

interface HappeningsResponse
{
    text: string[];
    timestamps: number[];
}

function parseApiHappenings(xmlHappenings: string): HappeningsResponse
{
    // Parse the XML string into a document
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlHappenings, "application/xml");

    // Extract all <TEXT> elements
    const textElements = xmlDoc.getElementsByTagName("TEXT");

    // Extract all <TIMESTAMP> elements
    const timestampElements = xmlDoc.getElementsByTagName("TIMESTAMP");

    // Convert the HTMLCollection to an array and extract the text content
    return {
        text: Array.from(textElements).map(elem => elem.textContent),
        timestamps: Array.from(timestampElements).map(elem => Number(elem.textContent))
    };
}

async function getStorageValue(key: string): Promise<any>
{
    return new Promise((resolve, reject) =>
    {
        chrome.storage.local.get(key, (result) =>
        {
            resolve(result[key]);
        });
    });
}

async function setStorageValue(key: string, value: any): Promise<void>
{
    return new Promise((resolve, reject) =>
    {
        chrome.storage.local.set({[key]: value}, () =>
        {
            resolve();
        });
    });
}

async function setDefaultStorageValues(): Promise<void>
{
    const defaultValues: { key: string, value: any }[] = [
        { key: 'jumppoint', value: 'artificial_solar_system' },
        { key: 'roname', value: 'Reliant' },
        { key: 'blockedregions', value: [] },
        { key: 'dossierkeywords', value: [] },
        { key: 'endorsekeywords', value: [] },
        { key: 'prepswitchers', value: [] },
        { key: 'switchers', value: [] },
        { key: 'raiderjp', value: 'suspicious'},
    ];

    for (const { key, value } of defaultValues) {
        if (await getStorageValue(key) === undefined) {
            await setStorageValue(key, value);
        }
    }
}

async function dieIfNoUserAgent(): Promise<void>
{
    const userAgent: string = await getStorageValue('useragent');
    if (userAgent) return;
    const cancellationNotyf = new Notyf({
        duration: 0,
        position: {
            x: 'right',
            y: 'top',
        },
        dismissible: false,
    });
    Array.from(document.querySelectorAll('input'))
        .filter((input) => input.id !== 'reliant-settings')
        .forEach((input) => input.disabled = true);
    cancellationNotyf.error('Please set your "Main Nation" in the <a href="/page=blank/reliant=settings">settings.</a>');
    throw new Error('No User Agent');
}

function canonicalize(str: string): string
{
    return str.trim().toLowerCase().replace(/ /g, '_');
}

function getUrlParameters(url: string): object
{
    const reg: RegExp = new RegExp('\/([A-Za-z0-9-]+?)=([A-Za-z0-9_.+]+)', 'g');
    let params: object = {};
    let match: string[];
    while ((match = reg.exec(url)) !== null)
        params[match[1]] = match[2];
    return params;
}

function pretty(str: string): string
{
    return str.replace(/_/g, ' ').replace(/\w+\s*/g, (txt: string) => txt.charAt(0).toUpperCase()
    + txt.substr(1).toLowerCase());
}

function getLocalId(page?: string): void
{
    const localId: HTMLInputElement = document.querySelector('input[name=localid]');
    if (localId)
        chrome.storage.local.set({'localid': localId.value});
    else if (page) {
        const localIdRegex: RegExp = new RegExp('<input type="hidden" name="localid" value="([A-Za-z0-9]+?)">');
        const match = localIdRegex.exec(page);
        chrome.storage.local.set({'localid': match[1]});
    }
    else
        return;
}

function getChk(page?: string): void
{
    const chk: HTMLInputElement = document.querySelector('input[name=chk]');
    if (chk)
        chrome.storage.local.set({'chk': chk.value});
    else if (page) {
        const chkRegex: RegExp = new RegExp('<input type="hidden" name="chk" value="([A-Za-z0-9]+?)">');
        const match: string[] = chkRegex.exec(page);
        chrome.storage.local.set({'chk': match[1]});
    }
    else
        return;
}

let inQuery = false;

async function makeAjaxQuery(url: string, method: string, data?: FormData, admit: boolean = false): Promise<string>
{
    const userAgent: string = await new Promise(resolve =>
    {
        chrome.storage.local.get('useragent', (result) =>
        {
            resolve(result.useragent);
        });
    });

    if (inQuery)
        return;
    let startTime = Date.now();

    // Recommended by Eluvatar: https://forum.nationstates.net/viewtopic.php?p=30083979#p30083979
    const fixedUrl: string = `${url}?script=reliant_${RELIANT_VERSION}_by_Haku_in_use_by_${userAgent}&userclick=${Date.now()}`;
    let request: Request;
    // redirect required if admitting to the WA
    if (!admit) {
        request = new Request(fixedUrl,
            {
                method: method,
                redirect: "manual",
                body: data ?? null,
                credentials: "include"
            });
    } else {
        request = new Request(fixedUrl,
            {
                method: method,
                redirect: "follow",
                body: data ?? null,
                credentials: "include"
            });
    }

    // Each button with class 'ajaxbutton' make a request to the NS webiste.
    // In order to abide by rule "4. Avoid Simultaneous Requests" we will keep all buttons
    // with this class disabled until we receive a complete response from the NS server.
    let ajaxButtons: NodeList = document.querySelectorAll('.ajaxbutton');
    for (let i = 0; i != ajaxButtons.length; i++)
        (ajaxButtons[i] as HTMLInputElement).disabled = true;

    inQuery = true;
    const response: Response = await fetch(request);

    let ret = await response.text();

    // We've received a complete response from the NS server, so we can allow more user input
    for (let i = 0; i != ajaxButtons.length; i++)
        (ajaxButtons[i] as HTMLInputElement).disabled = false;

    inQuery = false;

    if (document.querySelector('#load-time'))
        (document.querySelector('#load-time') as HTMLSpanElement).innerHTML =
            String(Date.now() - startTime) + ' ms';
    return ret;
}

function redirectPage(url: string): void
{
    let ajaxButtons: NodeList = document.querySelectorAll('.ajaxbutton');
    // Disable all buttons until the page is fully redirected, though this is likely unnecessary
    for (let i = 0; i != ajaxButtons.length; i++)
        (ajaxButtons[i] as HTMLInputElement).disabled = true;
    window.location.href = url;
}

const urlParameters: object = getUrlParameters(document.URL);
if (urlParameters['page'] !== 'blank') {
    getLocalId();
    getChk();
}

/*
 * Keybind Handling
 */

function keyPress(e: KeyboardEvent): void
{
    const textboxSelected: HTMLElement = document.querySelector('input:focus, textarea:focus');
    if (e.ctrlKey || e.altKey)
        return;
    else if (textboxSelected)
        return;
    // ignore caps lock
    const pressedKey: string = e.key.toUpperCase();
    if (pressedKey in keys)
        keys[pressedKey]();
}

document.addEventListener('keyup', keyPress);

/*
 * Keybind Functionality
 */

let keys: object = {};

chrome.storage.local.get('movekey', (result) =>
{
    const moveKey = result.movekey || 'X';
    keys[moveKey] = () =>
    {
        const moveButton: HTMLButtonElement = document.querySelector('button[name=move_region]');
        if (moveButton)
            moveButton.click();
        else if (urlParameters['reliant'] === 'main')
            (document.querySelector('#chasing-button') as HTMLInputElement).click();
        else if (urlParameters['region']) {
            const updateLocalIdButton: HTMLInputElement = document.querySelector('.updatelocalid[data-clicked="0"]');
            if (updateLocalIdButton)
                updateLocalIdButton.click();
            else
                (document.querySelector('#action-button') as HTMLInputElement).click();
        }
    };
});

chrome.storage.local.get('jpkey', (result) =>
{
    chrome.storage.local.get('jumppoint', (jpresult) =>
    {
        const jpKey = result.jpkey || 'V';
        const jumpPoint = jpresult.jumppoint || 'artificial_solar_system';
        keys[jpKey] = () =>
        {
            const moveButton: HTMLButtonElement = document.querySelector('button[name=move_region]');
            if (urlParameters['region'] === jumpPoint)
                moveButton.click();
            else if (urlParameters['reliant'] === 'main')
                (document.querySelector('#move-to-jp') as HTMLInputElement).click();
            else
                window.location.href = `/template-overall=none/region=${jumpPoint}`;
        };
    });
});

chrome.storage.local.get('mainpagekey', (result) =>
{
    const mainPageKey = result.mainpagekey || ' ';
    keys[mainPageKey] = () =>
    {
        window.location.href = '/template-overall=none/page=blank/reliant=main';
    };
});

chrome.storage.local.get('resignkey', (result) =>
{
    const resignKey = result.resignkey || '\'';
    keys[resignKey] = () =>
    {
        if (urlParameters['page'] === 'join_WA')
            (document.querySelector('button[class="button primary icon approve big"]') as HTMLButtonElement).click();
        else if (urlParameters['reliant'] === 'main') {
            chrome.storage.local.get('currentwa', (currentwaresult) =>
            {
                if ((!freshlyAdmitted) && (currentwaresult.currentwa))
                    (document.querySelector('#resign') as HTMLInputElement).click();
                else if ((!freshlyAdmitted))
                    (document.querySelector('#admit') as HTMLInputElement).click();
            });
        }
    };
});

chrome.storage.local.get('dossierkey', (result) =>
{
    const dossierKey = result.dossierkey || 'M';
    keys[dossierKey] = () =>
    {
        if (urlParameters['reliant'] === 'trackednations')
            (document.querySelector('#clear-tracked-nations') as HTMLButtonElement).click();
        else
            window.location.href = '/page=blank/reliant=trackednations';
    };
});

chrome.storage.local.get('dossiernationkey', (result) =>
{
    const dossierNationKey = result.dossiernationkey || 'N';
    keys[dossierNationKey] = () =>
    {
        const dossierButton: HTMLButtonElement = document.querySelector('#reliant-track');
        if (dossierButton)
            dossierButton.click();
        else if (urlParameters['reliant'] === 'main') {
            let refreshButton: HTMLInputElement = document.querySelector('#refresh-dossier');
            let dossierButton: HTMLInputElement = document.querySelector('.dossier[data-clicked="0"]');
            if (!dossierButton)
                refreshButton.click();
            else
                dossierButton.click();
        }
    };
});

chrome.storage.local.get('endorsekey', (result) =>
{
    const endorseKey = result.endorsekey || 'Z';
    keys[endorseKey] = () =>
    {
        const endorseButton: HTMLButtonElement = document.querySelector('button[class="endorse button icon wa"]');
        const crossEndorse: HTMLInputElement = document.querySelector('.cross');
        if (endorseButton)
            endorseButton.click();
        else if (crossEndorse)
            crossEndorse.click();
        else if (urlParameters['reliant'] === 'main') {
            let refreshButton: HTMLInputElement = document.querySelector('#refresh-endorse');
            let endorseButton: HTMLInputElement = document.querySelector('.endorse[data-clicked="0"]');
            const lastWAUpdate = document.querySelector('#last-wa-update');
            if (lastWAUpdate.innerHTML === 'Seconds ago')
                (document.querySelector('#copy-win') as HTMLInputElement).click();
            if (freshlyAdmitted)
                (document.querySelector('#update-localid') as HTMLInputElement).click();
            else {
                if (!endorseButton)
                    refreshButton.click();
                else
                    endorseButton.click();
            }
        }
        else if (urlParameters['region']) {
            let endorseButton: HTMLInputElement = document.querySelector('.endorse[data-clicked="0"]');
            let refreshButton: HTMLInputElement = document.querySelector('#refresh-endorse');
            if (!endorseButton)
                refreshButton.click();
            else
                endorseButton.click();
        }
    };
});

chrome.storage.local.get('gcrkey', (result) =>
{
    const gcrKey = result.gcrkey || 'G';
    keys[gcrKey] = () =>
    {
        window.location.href = '/page=ajax2/a=reports/view=world/filter=change';
    };
});

// probably won't be used much
chrome.storage.local.get('viewregionkey', (result) =>
{
    const viewRegionKey = result.viewregionkey || 'D';
    keys[viewRegionKey] = () =>
    {
        const regionButton: HTMLDivElement = document.querySelector('.paneltext:first-of-type');
        if (regionButton)
            regionButton.click();
        else if (urlParameters['page'] === 'change_region')
            (document.querySelector('.info > a') as HTMLAnchorElement).click();
        else if (urlParameters['reliant'] === 'main')
            (document.querySelector('#open-region') as HTMLInputElement).click();
    };
});

chrome.storage.local.get('didiupdatekey', (result) =>
{
    const didIUpdateKey = result.didiupdatekey || 'U';
    keys[didIUpdateKey] = () =>
    {
        if (urlParameters['reliant'] === 'main')
            (document.querySelector('#check-if-updated') as HTMLInputElement).click();
        else
            window.location.href = '/page=ajax2/a=reports/view=self/filter=change';
    };
});

chrome.storage.local.get('delegatekey', (result) =>
{
    const delegateKey = result.delegatekey || 'A';
    keys[delegateKey] = () =>
    {
        if (urlParameters['region']) {
            const delegateNation = canonicalize(document.querySelector('#regioncontent > p:nth-child(2) > a > span > span.nname').innerHTML);
            window.location.href = `https://www.nationstates.net/nation=${delegateNation}`;
            return;
        }
        // Copy Nation Link
        else if (urlParameters['page'] === 'un') {
            let nationLink = 'https://www.nationstates.net/nation=' + document.getElementById('loggedin')
                    .getAttribute('data-nname');
            const copyText = document.createElement('textarea');
            copyText.value = nationLink;
            document.body.appendChild(copyText);
            copyText.select();
            document.execCommand('copy');
            document.body.removeChild(copyText);
        }
        else if (urlParameters['reliant'] === 'main')
            (document.querySelector('#endorse-delegate') as HTMLInputElement).click();
    };
});

chrome.storage.local.get('worldactivitykey', (result) =>
{
    const worldActivityKey = result.worldactivitykey || 'F';
    keys[worldActivityKey] = () =>
    {
        if (urlParameters['reliant'] !== 'main')
            window.location.href = '/page=activity/view=world/filter=move+member+endo';
        else
            (document.querySelector('#update-world-happenings') as HTMLInputElement).click();
    };
});

chrome.storage.local.get('refreshkey', (result) =>
{
    const refreshKey = result.refreshkey || 'C';
    keys[refreshKey] = () =>
    {
        if (urlParameters['reliant'] === 'main')
            (document.querySelector('#update-region-status') as HTMLInputElement).click();
        else
            location.reload();
    };
});

chrome.storage.local.get('settingskey', (result) =>
{
    const settingsKey = result.settingskey || '0';
    keys[settingsKey] = () =>
    {
        window.location.href = '/page=blank/reliant=settings';
    };
});

chrome.storage.local.get('prepkey', (result) =>
{
    const prepKey = result.prepkey || 'P';
    keys[prepKey] = () =>
    {
        if (urlParameters['reliant'] === 'prep')
            (document.querySelector('#prep-button') as HTMLInputElement).click();
        else
            window.location.href = '/template-overall=none/page=blank/reliant=prep';
    };
});

/*
 * Miscellaneous
 */

const settingsParent = document.querySelector('.belspacer.belspacermain');
if (settingsParent) {
    // Settings Button
    let settingsDiv: HTMLDivElement = document.createElement('div');
    settingsDiv.setAttribute('class', 'bel');
    let settingsButton: HTMLInputElement = document.createElement('input');
    settingsButton.setAttribute('type', 'button');
    settingsButton.setAttribute('id', 'reliant-settings');
    settingsButton.setAttribute('class', 'ajaxbutton');
    settingsButton.value = 'Reliant Settings';
    settingsDiv.appendChild(settingsButton);

    // Main Reliant Button
    let reliantButton: HTMLInputElement = document.createElement('input');
    reliantButton.setAttribute('type', 'button');
    reliantButton.setAttribute('id', 'reliant-main');
    reliantButton.setAttribute('class', 'ajaxbutton');
    reliantButton.value = 'Reliant';
    settingsDiv.appendChild(reliantButton);
    settingsParent.insertBefore(settingsDiv, settingsParent.firstChild);
    document.querySelector('#reliant-settings').addEventListener('click', (e: MouseEvent) =>
    {
        redirectPage('/page=blank/reliant=settings');
    });
    document.querySelector('#reliant-main').addEventListener('click', (e: MouseEvent) =>
    {
        redirectPage('/template-overall=none/page=blank/reliant=main');
    });

    // Prep Page
    let prepButton: HTMLInputElement = document.createElement('input');
    prepButton.setAttribute('type', 'button');
    prepButton.setAttribute('id', 'reliant-prep');
    prepButton.setAttribute('class', 'ajaxbutton');
    prepButton.value = 'Prep';
    settingsDiv.appendChild(prepButton);
    prepButton.addEventListener('click', (e: MouseEvent) =>
    {
        redirectPage('/template-overall=none/page=blank/reliant=prep');
    });
}

(async () =>
{
    await setDefaultStorageValues();
    const userAgent = await getStorageValue('useragent');
    await chrome.runtime.sendMessage({ userAgent: userAgent });
})();