const pageContent: HTMLElement = document.querySelector('#content');
pageContent.innerHTML = `
<h1>Reliant Settings</h1>
<form>
<fieldset>
<legend>Find My WA</legend>
<input type="button" class="ajaxbutton" id="find-wa" value="Find My WA">
<p id="find-wa-output"></p>
</fieldset>
<fieldset>
<legend>Clear Stored World Assembly Applications</legend>
<input class="button" type="button" id="clear-wa-apps" value="Clear WA Apps">
</fieldset>
<fieldset>
<p>This nation will be used to identify yourself in all requests to NationStates.</p>
<legend>Main Nation</legend>
<input type="text" id="new-main-nation">
<input class="button" type="button" id="set-main-nation" value="Set">
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
<legend>Endorse Inclusion</legend>
<p>Same as above, but for endorsing. <b>Leave blank to show all defender nations.</b></p>
<p>
<textarea id="endorse-keywords"></textarea>
</p>
<input type="button" id="set-endorse-keywords" value="Set">
</fieldset>
<fieldset>
<legend>Background Image</legend>
<input type="file" id="new-background-image">
<br/>
<img id="uploaded-background-image" style="max-width:60%;"></img>
<br/>
<input class="button" type="button" id="set-background-image" value="Set">
<input class="button" type="button" id="unset-background-image" value="Remove Background Image">
</fieldset>
<fieldset>
<legend>Prepping</legend>
<p><strong>Password</strong></p>
<input type="password" id="my-password">
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
<fieldset>
<legend>Occupation Chasing Mode</legend>
<p>When enabled, the move key will step through a sequence: Chase → Update Localid → Update Region Status → Endorse Delegate. Each step requires a separate keypress.</p>
<input type="checkbox" id="occupation-mode-toggle">
<label for="occupation-mode-toggle">Enable Occupation Chasing Mode</label>
<p>Current: <b id="current-occupation-mode">Disabled</b></p>
</fieldset>
<fieldset>
<legend>Move Success Sound</legend>
<p>When enabled, a notification sound will play when you successfully move to a different region.</p>
<input type="checkbox" id="move-sound-toggle" checked>
<label for="move-sound-toggle">Play sound on successful region move</label>
<p>Current: <b id="current-move-sound-status">Enabled</b></p>
<p>Volume: <input type="range" id="move-sound-volume" min="0" max="100" value="50">
<span id="current-move-sound-volume">50</span>%</p>
</fieldset>
<fieldset>
<legend>Custom Move Success Sound</legend>
<p>Upload your own sound file to play when you successfully move to a different region.</p>
<input type="file" id="new-custom-sound" accept="audio/*">
<br/>
<audio id="uploaded-custom-sound" controls style="max-width:60%; margin: 10px 0;"></audio>
<br/>
<input class="button" type="button" id="test-custom-sound" value="Test Sound">
<input class="button" type="button" id="set-custom-sound" value="Set Custom Sound">
<input class="button" type="button" id="unset-custom-sound" value="Remove Custom Sound">
<p>Current: <b id="current-custom-sound-status">Default</b></p>
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
<input type="text" id="new-key" maxlength="5">
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

document.querySelector('#set-main-nation').addEventListener('click', setUserAgent);
document.querySelector('#set-key').addEventListener('click', setKey);
document.querySelector('#set-jump-point').addEventListener('click', setJumpPoint);
document.querySelector('#set-ro-name').addEventListener('click', setRoName);
document.querySelector('#set-max-happenings').addEventListener('click', setMaxHappeningsCount);
document.querySelector('#set-switchers').addEventListener('click', setSwitchers);
document.querySelector('#set-password').addEventListener('click', setPassword);
document.querySelector('#clear-wa-apps').addEventListener('click', clearStoredWaApplications);
document.querySelector('#set-blocked-regions').addEventListener('click', setBlockedRegions);
document.querySelector('#set-dossier-keywords').addEventListener('click', setDossierKeywords);
document.querySelector('#set-endorse-keywords').addEventListener('click', setEndorseKeywords);
document.querySelector('#find-wa').addEventListener('click', findMyWa);
document.querySelector('#set-background-image').addEventListener('click', setBackgroundImage);
document.querySelector('#unset-background-image').addEventListener('click', unsetBackgroundImage);
document.querySelector('#new-background-image').addEventListener('change', loadBackgroundImage);
document.querySelector('#occupation-mode-toggle').addEventListener('change', toggleOccupationMode);
document.querySelector('#move-sound-toggle').addEventListener('change', toggleMoveSound);
document.querySelector('#move-sound-volume').addEventListener('input', setMoveSoundVolume);
document.querySelector('#new-custom-sound').addEventListener('change', loadCustomSound);
document.querySelector('#test-custom-sound').addEventListener('click', testCustomSound);
document.querySelector('#set-custom-sound').addEventListener('click', setCustomSound);
document.querySelector('#unset-custom-sound').addEventListener('click', unsetCustomSound);

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

async function setUserAgent(e: MouseEvent): Promise<void>
{
    const newUserAgent: string = canonicalize((document.querySelector('#new-main-nation') as HTMLInputElement).value);
    await setStorageValue('useragent', newUserAgent);
    notyf.success(`Set identifier to ${newUserAgent}`);
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

function loadBackgroundImage(e: Event): void
{
    var files = (e.target as HTMLInputElement).files;
    
    if (files && files.length) {
        var reader = new FileReader();
        reader.onload = function () {
            (document.querySelector("#uploaded-background-image") as HTMLImageElement).src = 
                reader.result as string;
        }
        reader.readAsDataURL(files[0]);
    }
}

function setBackgroundImage(e: MouseEvent): void
{
    const image = (document.querySelector('#uploaded-background-image') as HTMLImageElement);

    if(!image.complete || image.naturalWidth === 0)
        throw new Error("Image isn't loaded yet");
    
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Failed to get canvas context");

    ctx.drawImage(image, 0, 0);

    chrome.storage.local.set({'background': canvas.toDataURL('image/png')});
    notyf.success(`Set new background image`);
}

function unsetBackgroundImage(e: MouseEvent): void
{
    chrome.storage.local.remove('background');
    notyf.success('Cleared background image.');
}

function loadCustomSound(e: Event): void
{
    var files = (e.target as HTMLInputElement).files;
    
    if (files && files.length) {
        var reader = new FileReader();
        reader.onload = function () {
            (document.querySelector("#uploaded-custom-sound") as HTMLAudioElement).src = 
                reader.result as string;
        }
        reader.readAsDataURL(files[0]);
    }
}

function setCustomSound(e: MouseEvent): void
{
    const audio = (document.querySelector('#uploaded-custom-sound') as HTMLAudioElement);

    if(!audio.src)
        throw new Error("No audio file loaded");
    
    chrome.storage.local.set({'customMoveSound': audio.src});
    document.querySelector('#current-custom-sound-status').innerHTML = 'Custom';
    notyf.success(`Set custom move success sound`);
}

function unsetCustomSound(e: MouseEvent): void
{
    chrome.storage.local.remove('customMoveSound');
    document.querySelector('#current-custom-sound-status').innerHTML = 'Default';
    (document.querySelector('#uploaded-custom-sound') as HTMLAudioElement).src = '';
    notyf.success('Removed custom sound. Using default sound.');
}

async function testCustomSound(e: MouseEvent): Promise<void>
{
    const audio = (document.querySelector('#uploaded-custom-sound') as HTMLAudioElement);
    
    if(!audio.src) {
        notyf.error('No audio file loaded to test');
        return;
    }
    
    try {
        const volumePercentage = parseInt((document.querySelector('#move-sound-volume') as HTMLInputElement).value);
        audio.volume = volumePercentage / 100;
        await audio.play();
        notyf.success('Playing test sound');
    } catch (error) {
        console.log('Failed to play test sound:', error);
        notyf.error('Failed to play test sound');
    }
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

function setEndorseKeywords(e: MouseEvent): void
{
    let dossierKeywords: string[] = (document.querySelector('#endorse-keywords') as HTMLTextAreaElement)
        .value.split('\n');
    for (let i = 0; i !== dossierKeywords.length; i++)
        dossierKeywords[i] = dossierKeywords[i].toLowerCase();
    chrome.storage.local.set({'endorsekeywords': dossierKeywords});
    notyf.success(`Set endorse keywords.`);
}

async function findMyWa(e: MouseEvent): Promise<void>
{
    // It wouldn't work using fetch/makeAjaxQuery, I seriously have no idea why - Haku
    const xhr = new XMLHttpRequest();

    xhr.open('GET', '/cgi-bin/api.cgi?wa=1&q=members', true);

    xhr.onreadystatechange = async function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const xmlDoc = xhr.responseXML;

            const membersElement = xmlDoc.querySelector('MEMBERS').textContent;
            if (!membersElement) return;
            const members = membersElement.split(',');
            const prepSwitchers = await getStorageValue('prepswitchers');
            let wa: string = members.find((member) => prepSwitchers.includes(member));
            const output = document.querySelector('#find-wa-output');
            output.innerHTML = wa ? `Found WA: ${wa}` : 'Could not find WA.';

        }
    };
    (e.target as HTMLInputElement).disabled = true;
    xhr.send();
}

async function toggleOccupationMode(e: Event): Promise<void>
{
    const isEnabled = (e.target as HTMLInputElement).checked;
    await setStorageValue('occupationmode', isEnabled);
    await setStorageValue('occupationsequence', 'ready');
    document.querySelector('#current-occupation-mode').innerHTML = isEnabled ? 'Enabled' : 'Disabled';
    notyf.success(`Occupation mode ${isEnabled ? 'enabled' : 'disabled'}`);
}

async function toggleMoveSound(e: Event): Promise<void>
{
    const isEnabled = (e.target as HTMLInputElement).checked;
    await setStorageValue('moveSoundEnabled', isEnabled);
    document.querySelector('#current-move-sound-status').innerHTML = isEnabled ? 'Enabled' : 'Disabled';
    notyf.success(`Move sound ${isEnabled ? 'enabled' : 'disabled'}`);
}

async function setMoveSoundVolume(e: Event): Promise<void>
{
    const volume = parseInt((e.target as HTMLInputElement).value);
    await setStorageValue('moveSoundVolume', volume);
    document.querySelector('#current-move-sound-volume').innerHTML = volume.toString();
    // notyf.success(`Move sound volume set to ${volume}%`);
}

chrome.storage.local.get(['prepswitchers', 'password'], (result) =>
{
    const currentSwitcherSet = document.querySelector('#current-switcher-set');
    const prepSwitchers = result.prepswitchers ?? [];
    const password = result.password || '';

    // Create a document fragment
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < prepSwitchers.length; i++) {
        const switcherName = prepSwitchers[i];

        // Create anchor element
        const anchor = document.createElement('a');
        anchor.href = `/page=un?nation=${switcherName}&password=${password}&logging_in=1`;
        anchor.target = '_blank';
        anchor.textContent = switcherName;

        // Append anchor to the fragment
        fragment.appendChild(anchor);

        // Add a <br> element
        fragment.appendChild(document.createElement('br'));
    }

    // Append the fragment to the DOM once
    currentSwitcherSet.appendChild(fragment);
});

chrome.storage.local.get('switchers', (result) => {
    const currentApplications = document.querySelector('#current-stored-applications');
    const applications = result.switchers ?? []; // Assuming Switcher[] is inferred or defined elsewhere

    // Create a document fragment
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < applications.length; i++) {
        const application = applications[i];

        // Create a paragraph element
        const p = document.createElement('p');

        // Set its innerHTML to include the name and ID
        p.innerHTML = `Name: ${application.name}<br>ID: ${application.appid}`;
        
        // Append the paragraph to the fragment
        fragment.appendChild(p);
    }

    // Append the fragment to the DOM once
    currentApplications.appendChild(fragment);
});

/*
 * Initialization
 */

(async () =>
{
    await setDefaultStorageValues();

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
            getCurrentKey('useragent'),
            getCurrentKey('jumppoint'),
            getCurrentKey('roname'),
            getCurrentKey('blockedregions'),
            getCurrentKey('dossierkeywords'),
            getCurrentKey('endorsekeywords'),
            getCurrentKey('occupationmode'),
            getCurrentKey('moveSoundEnabled'),
            getCurrentKey('moveSoundVolume'),
            getCurrentKey('customMoveSound')
        ]);

        (document.querySelector('#new-main-nation') as HTMLInputElement).value = currentSettings[0];
        document.querySelector('#current-jumppoint').innerHTML = currentSettings[1];
        document.querySelector('#current-roname').innerHTML = currentSettings[2];
        const blockedRegions = currentSettings[3] ?? [];
        const dossierKeywords = currentSettings[4] ?? [];
        const endorseKeywords = currentSettings[5] ?? [];
        const occupationMode = currentSettings[6] ?? false;
        const moveSoundEnabled = currentSettings[7] ?? false;
        const moveSoundVolume = currentSettings[8] ?? 50;
        const customMoveSound = currentSettings[9];
        
        for (let i = 0; i !== blockedRegions.length; i++)
            document.querySelector('#current-blocked-regions').innerHTML += `${blockedRegions[i]}<br>`;
        for (let i = 0; i !== dossierKeywords.length; i++)
            document.querySelector('#current-dossier-keywords').innerHTML += `<b>${dossierKeywords[i]}</b><br>`;
        for (let i = 0; i !== endorseKeywords.length; i++)
            (document.querySelector('#endorse-keywords') as HTMLTextAreaElement).value += `${endorseKeywords[i]}\n`;
        
        (document.querySelector('#occupation-mode-toggle') as HTMLInputElement).checked = Boolean(occupationMode);
        document.querySelector('#current-occupation-mode').innerHTML = occupationMode ? 'Enabled' : 'Disabled';
        
        (document.querySelector('#move-sound-toggle') as HTMLInputElement).checked = Boolean(moveSoundEnabled);
        document.querySelector('#current-move-sound-status').innerHTML = moveSoundEnabled ? 'Enabled' : 'Disabled';
        
        (document.querySelector('#move-sound-volume') as HTMLInputElement).value = moveSoundVolume.toString();
        document.querySelector('#current-move-sound-volume').innerHTML = moveSoundVolume.toString();
        
        // Set custom sound status
        document.querySelector('#current-custom-sound-status').innerHTML = customMoveSound ? 'Custom' : 'Default';
    }

    await displayCurrentKeys();
    await displayCurrentSettings();
})();
