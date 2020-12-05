const pageContent: HTMLElement = document.querySelector('#content');
pageContent.innerHTML = `
<h1>Reliant Settings</h1>
<form>
<fieldset>
<legend>Clear Stored World Assembly Applications</legend>
<input class="button" type="button" id="clear-wa-apps" value="Clear WA Apps">
</fieldset>
<fieldset>
<legend>Jump Point</legend>
<input type="text" id="new-jump-point">
<input class="button" type="button" id="set-jump-point" value="Set">
<p>Current: <b id="current-jumppoint"></b></p>
</fieldset>
<fieldset>
<legend>Regional Officer Name</legend>
<input type="text" id="new-ro-name">
<input class="button" type="button" id="set-ro-name" value="Set">
<p>Current: <b id="current-roname"></b></p>
</fieldset>
<fieldset>
<legend>Blocked Regions</legend>
<p>Enter a list of region names, one per line. You will be blocked from chasing raiders into these regions. Use this
to avoid common thorn regions.</p>
<p>Recommendations:
<pre>
devide_by_zero
artificial_solar_system
trieltics
3_guys
frozen_circle
switz
plum_island
no_nope_and_nay
vienna
crystal_falls
birb
the_allied_nations_of_egalaria
the_evil_empire
hatari
</pre>
</p>
<textarea id="blocked-regions"></textarea>
<input class="button" type="button" id="set-blocked-regions" value="Set">
<p>Current: <p><b id="current-blocked-regions"></b></p></p>
</fieldset>
<fieldset>
<legend>Dossier Inclusion</legend>
<p>Enter a list of keywords, one per line. Only raider nations with any of these keywords in their name will have
a dossier button on the main page. Useful for chasing specific teams. <b>Leave blank to show all raider nations.</b></p>
<p>
<textarea id="dossier-keywords"></textarea>
</p>
<input type="button" id="set-dossier-keywords" value="Set">
<p id="current-dossier-keywords"></p>
</fieldset>
<fieldset>
<legend>Prepping</legend>
<p><strong>Password</strong></p>
<input type="text" id="my-password">
<input class="button" type="button" id="set-password" value="Set">
<p><strong>Switchers</strong></p>
<textarea id="switchers"></textarea>
<input class="button" type="button" id="set-switchers" value="Set">
</fieldset>
<fieldset id="max-happenings">
<legend>Max Happenings Count</legend>
<p>The number of happenings in these sections will not exceed this number. Used for saving screen space.</p>
<p>
<label>Endorse</label>
<input type="radio" name="max-happenings-section" value="endorsehappeningscount">
</p>
<p>
<label>Dossier</label>
<input type="radio" name="max-happenings-section" value="dossierhappeningscount">
</p>
<p>
<label>Region</label>
<input type="radio" name="max-happenings-section" value="regionhappeningscount">
</p>
<p>
<label>World</label>
<input type="radio" name="max-happenings-section" value="worldhappeningscount">
</p>
<p>
<label>Reports</label>
<input type="radio" name="max-happenings-section" value="reportscount"
</p>
<p><input type="number" id="max-happenings-count" min="1" max="20"></p>
<p><input class="button" type="button" id="set-max-happenings" value="Set"></p>
</fieldset>
<fieldset id="keys">
<legend>Change Keys</legend>
<p id="current-key"></p>
<p>
<label for="movekey">Move Key</label>
<input type="radio" name="key-to-change" value="movekey">
Current:
<b id="currentmovekey"></b>
</p>
<p>
<label for="jpkey">Jump Point Key</label>
<input type="radio" name="key-to-change" value="jpkey">
Current:
<b id="currentjpkey"></b>
</p>
<p>
<label for="refreshkey">Refresh Key</label>
<input type="radio" name="key-to-change" value="refreshkey">
Current:
<b id="currentrefreshkey"></b>
</p>
<p>
<label for="mainpagekey">Main Page Key</label>
<input type="radio" name="key-to-change" value="mainpagekey">
Current:
<b id="currentmainpagekey"></b>
</p>
<p>
<label for="resignkey">Resign Key</label>
<input type="radio" name="key-to-change" value="resignkey">
Current:
<b id="currentresignkey"></b>
</p>
<p>
<label for="dossierkey">View/Clear Dossier Key</label>
<input type="radio" name="key-to-change" value="dossierkey">
Current:
<b id="currentdossierkey"></b>
</p>
<p>
<label for="dossiernationkey">Dossier Nation Key</label>
<input type="radio" name="key-to-change" value="dossiernationkey">
Current:
<b id="currentdossiernationkey"></b>
</p>
<p>
<label for="endorsekey">Endorse Key</label>
<input type="radio" name="key-to-change" value="endorsekey">
Current:
<b id="currentendorsekey"></b>
</p>
<p>
<label for="gcrkey">GCR Updating Key</label>
<input type="radio" name="key-to-change" value="gcrkey">
Current:
<b id="currentgcrkey"></b>
</p>
<p>
<label for="viewregionkey">View Region</label>
<input type="radio" name="key-to-change" value="viewregionkey">
Current:
<b id="currentviewregionkey"></b>
</p>
<p>
<label for="rokey">RO Key</label>
<input type="radio" name="key-to-change" value="rokey">
Not Implemented
</p>
<p>
<label for="worldactivitykey">World Activity Key</label>
<input type="radio" name="key-to-change" value="worldactivitykey">
Current:
<b id="currentworldactivitykey"></b>
</p>
<p>
<label for="didiupdatekey">Did I Update? Key</label>
<input type="radio" name="key-to-change" value="didiupdatekey">
Current:
<b id="currentdidiupdatekey"></b>
</p>
<p>
<label for="delegatekey">Endorse Delegate Key</label>
<input type="radio" name="key-to-change" value="delegatekey">
Current:
<b id="currentdelegatekey"></b>
</p>
<p>
<label for="prepkey">Prep Key</label>
<input type="radio" name="key-to-change" value="prepkey">
Current:
<b id="currentprepkey"></b>
</p>
<p>
<label>Settings Key</label>
<input type="radio" name="key-to-change" value="settingskey">
Current:
<b id="currentsettingskey"></b>
</p>
<input type="text" id="new-key" maxlength="1">
<input class="button" type="button" id="set-key" value="Set">
</fieldset>
</form>
<h2>Current Prep Switcher Set</h2>
<p id="current-switcher-set"></p>
<h2>Currently Stored Applications</h2>
<p id="current-stored-applications"></p>
`;

let notyf = new Notyf({
    duration: 3000,
    position: {
        x: 'right',
        y: 'top'
    }
});

/*
 * Event Listeners
 */

document.querySelector('#set-key').addEventListener('click', setKey);
document.querySelector('#set-jump-point').addEventListener('click', setJumpPoint);
document.querySelector('#set-ro-name').addEventListener('click', setRoName);
document.querySelector('#set-max-happenings').addEventListener('click', setMaxHappeningsCount);
document.querySelector('#set-switchers').addEventListener('click', setSwitchers);
document.querySelector('#set-password').addEventListener('click', setPassword);
document.querySelector('#clear-wa-apps').addEventListener('click', clearStoredWaApplications);
document.querySelector('#set-blocked-regions').addEventListener('click', setBlockedRegions);
document.querySelector('#set-dossier-keywords').addEventListener('click', setDossierKeywords);

/*
 * Handlers
 */

function setKey(e: MouseEvent): void
{
    let keyToSet: string;
    const key: string = (document.querySelector('#new-key') as HTMLInputElement).value.toUpperCase();
    const radioButtons: NodeList = document.querySelector('#keys').querySelectorAll('input[type=radio]');
    for (let i = 0; i != radioButtons.length; i++) {
        if ((radioButtons[i] as HTMLInputElement).checked) {
            keyToSet = (radioButtons[i] as HTMLInputElement).value;
            break;
        }
    }
    (document.querySelector('#new-key') as HTMLInputElement).value = '';
    chrome.storage.local.set({[keyToSet]: key});
    notyf.success(`Set function "${keyToSet}" to key ${key}`);
}

function setJumpPoint(e: MouseEvent): void
{
    const newJumpPoint: string = canonicalize((document.querySelector('#new-jump-point') as HTMLInputElement).value);
    chrome.storage.local.set({'jumppoint': newJumpPoint});
    notyf.success(`Set jump point to ${newJumpPoint}`);
}

function setRoName(e: MouseEvent): void
{
    const newRoName: string = (document.querySelector('#new-ro-name') as HTMLInputElement).value;
    chrome.storage.local.set({'roname': newRoName});
    notyf.success(`Set detag RO name to ${newRoName}`);
}

function setMaxHappeningsCount(e: MouseEvent): void
{
    const maxHappeningsCount = (document.querySelector('#max-happenings-count') as HTMLInputElement).value;
    const radioButtons = document.querySelector('#max-happenings').querySelectorAll('input[type=radio]');
    let happeningSetting: string;
    for (let i = 0; i != radioButtons.length; i++) {
        if ((radioButtons[i] as HTMLInputElement).checked) {
            happeningSetting = (radioButtons[i] as HTMLInputElement).value;
            break;
        }
    }
    chrome.storage.local.set({[happeningSetting]: maxHappeningsCount});
    notyf.success(`Set ${happeningSetting} to ${maxHappeningsCount}`);
}

function setSwitchers(e: MouseEvent): void
{
    let switchers: string[] = (document.querySelector('#switchers') as HTMLTextAreaElement).value.split('\n');
    for (let i = 0; i != switchers.length; i++)
        switchers[i] = canonicalize(switchers[i]);
    chrome.storage.local.set({'prepswitchers': switchers});
    notyf.success(`Set list of ${switchers.length} switchers.`);
}

function setPassword(e: MouseEvent): void
{
    const password = (document.querySelector('#my-password') as HTMLInputElement).value;
    chrome.storage.local.set({'password': password});
    notyf.success(`Set password to ${password}`);
}

function clearStoredWaApplications(e: MouseEvent): void
{
    chrome.storage.local.set({'switchers': []});
    notyf.success('Cleared all stored WA applications.');
}

function setBlockedRegions(e: MouseEvent): void
{
    let blockedRegions: string[] = (document.querySelector('#blocked-regions') as HTMLTextAreaElement).
        value.split('\n');
    for (let i = 0; i !== blockedRegions.length; i++)
        blockedRegions[i] = canonicalize(blockedRegions[i]);
    chrome.storage.local.set({'blockedregions': blockedRegions});
    notyf.success(`Set blocked regions.`);
}

function setDossierKeywords(e: MouseEvent): void
{
    let dossierKeywords: string[] = (document.querySelector('#dossier-keywords') as HTMLTextAreaElement)
        .value.split('\n');
    for (let i = 0; i !== dossierKeywords.length; i++)
        dossierKeywords[i] = dossierKeywords[i].toLowerCase();
    chrome.storage.local.set({'dossierkeywords': dossierKeywords});
    notyf.success(`Set dossier keywords.`);
}

chrome.storage.local.get(['prepswitchers', 'password'], (result) =>
{
    const currentSwitcherSet = document.querySelector('#current-switcher-set');
    const prepSwitchers: string[] = result.prepswitchers;
    for (let i = 0; i != prepSwitchers.length; i++)
        currentSwitcherSet.innerHTML +=
            `<a href="/page=un?nation=${prepSwitchers[i]}&password=${result.password}&logging_in=1" target="_blank">${prepSwitchers[i]}</a><br>`;
});

chrome.storage.local.get('switchers', (result) =>
{
    const currentApplications = document.querySelector('#current-stored-applications');
    const applications: Switcher[] = result.switchers;
    for (let i = 0; i !== applications.length; i++) {
        currentApplications.innerHTML += `<p>Name: ${applications[i].name}<br>ID: ${applications[i].appid}</p>`;
    }
});

/*
 * Initialization
 */

(() =>
{
    async function getCurrentKey(key: string): Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            chrome.storage.local.get(key, (result) =>
            {
                resolve(result[key]);
            });
        });
    }

    async function displayCurrentKeys(): Promise<void>
    {
        const currentKeys = await Promise.all([
            getCurrentKey('movekey'),
            getCurrentKey('jpkey'),
            getCurrentKey('refreshkey'),
            getCurrentKey('mainpagekey'),
            getCurrentKey('resignkey'),
            getCurrentKey('dossierkey'),
            getCurrentKey('dossiernationkey'),
            getCurrentKey('endorsekey'),
            getCurrentKey('gcrkey'),
            getCurrentKey('viewregionkey'),
            getCurrentKey('worldactivitykey'),
            getCurrentKey('didiupdatekey'),
            getCurrentKey('delegatekey'),
            getCurrentKey('prepkey'),
            getCurrentKey('settingskey')
        ]);

        document.querySelector('#currentmovekey').innerHTML = currentKeys[0] || 'X';
        document.querySelector('#currentjpkey').innerHTML = currentKeys[1] || 'V';
        document.querySelector('#currentrefreshkey').innerHTML = currentKeys[2] || 'C';
        document.querySelector('#currentmainpagekey').innerHTML = currentKeys[3] || 'Space';
        document.querySelector('#currentresignkey').innerHTML = currentKeys[4] || "'";
        document.querySelector('#currentdossierkey').innerHTML = currentKeys[5] || 'M';
        document.querySelector('#currentdossiernationkey').innerHTML = currentKeys[6] || 'N';
        document.querySelector('#currentendorsekey').innerHTML = currentKeys[7] || 'Z';
        document.querySelector('#currentgcrkey').innerHTML = currentKeys[8] || 'G';
        document.querySelector('#currentviewregionkey').innerHTML = currentKeys[9] || 'D';
        document.querySelector('#currentworldactivitykey').innerHTML = currentKeys[10] || 'F';
        document.querySelector('#currentdidiupdatekey').innerHTML = currentKeys[11] || 'U';
        document.querySelector('#currentdelegatekey').innerHTML = currentKeys[12] || 'A';
        document.querySelector('#currentprepkey').innerHTML = currentKeys[13] || 'P';
        document.querySelector('#currentsettingskey').innerHTML = currentKeys[14] || '0';
    }

    async function displayCurrentSettings(): Promise<void>
    {
        const currentSettings = await Promise.all([
            getCurrentKey('jumppoint'),
            getCurrentKey('roname'),
            getCurrentKey('blockedregions'),
            getCurrentKey('dossierkeywords')
        ]);

        document.querySelector('#current-jumppoint').innerHTML = currentSettings[0];
        document.querySelector('#current-roname').innerHTML = currentSettings[1];
        const blockedRegions = currentSettings[2];
        const dossierKeywords = currentSettings[3];
        for (let i = 0; i !== blockedRegions.length; i++)
            document.querySelector('#current-blocked-regions').innerHTML += `${blockedRegions[i]}<br>`;
        for (let i = 0; i !== dossierKeywords.length; i++)
            document.querySelector('#current-dossier-keywords').innerHTML += `<b>${dossierKeywords[i]}</b><br>`;
    }

    displayCurrentKeys();
    displayCurrentSettings();
})();