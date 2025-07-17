/* Every button with class "ajaxbutton" indicates that the button makes a request to
 * the NS server. The "makeAjaxQuery" function will disable these buttons when a request
 * starts and will only be re-enabled once a complete response has been received from the
 * NS server in order to comply with rule "4. Avoid Simultaneous Requests".
 */
(async () => {
    await dieIfNoUserAgent();

    const changeRegionForm: Element = document.querySelector('form[action="page=change_region"]');
    const moveButton: Element = document.querySelector('button[name=move_region]');
    if (moveButton) {
        moveButton.classList.add('ajaxbutton');
        moveButton.addEventListener('click', moveToRegion);
    }
    const currentRegionName: string = urlParameters['region'];

    const detaggingDiv: HTMLDivElement = document.createElement('div');

    const actionButton: HTMLInputElement = document.createElement('input');
    const regionStatus: HTMLParagraphElement = document.createElement('p');
    regionStatus.innerHTML = 'Awaiting region update.';

    actionButton.setAttribute('type', 'button');
    actionButton.setAttribute('id', 'action-button');
    actionButton.setAttribute('class', 'ajaxbutton');
    actionButton.setAttribute('style', 'padding: 20px; margin: 0 auto; display: block;');
    actionButton.setAttribute('value', 'Refresh');

    detaggingDiv.appendChild(regionStatus);
    detaggingDiv.appendChild(actionButton);
    detaggingDiv.setAttribute
    ('style', 'background-color: #1F202D; color: #fff; position: fixed; right: 0px; bottom: 0px; z-index: 9999;');

    let endorseList: HTMLUListElement;
    let regionalOfficersToDismiss: string[] = [];

    if (!(urlParameters['template-overall'])) {
        document.querySelector('#content').appendChild(detaggingDiv);
        const sidePanel: Element = document.querySelector('#panel');
        sidePanel.innerHTML += '<p id="endorse-status">Awaiting localid update.</p>';
        sidePanel.innerHTML += '<input class="ajaxbutton" type="button" value="Refresh" id="refresh-endorse">';
        sidePanel.innerHTML +=
            '<input class="ajaxbutton updatelocalid" type="button" value="Update Localid" data-clicked="0" id="update-localid">';
        sidePanel.innerHTML += '<ul id="endorse-list"></ul>';
        endorseList = document.querySelector('#endorse-list');
        document.querySelector('#refresh-endorse').addEventListener('click', refreshEndorseList);
        document.querySelector('#update-localid').addEventListener('click', manualLocalIdUpdate);
    } else {
        document.body.appendChild(detaggingDiv);
        const topPanel: Element = document.createElement('div');
        topPanel.innerHTML += '<p id="endorse-status">Awaiting localid update.</p>';
        topPanel.innerHTML += '<input class="ajaxbutton" type="button" value="Refresh" id="refresh-endorse">';
        topPanel.innerHTML +=
            '<input class="ajaxbutton updatelocalid" type="button" value="Update Localid" data-clicked="0" id="update-localid">';
        topPanel.innerHTML += '<ul id="endorse-list"></ul>';
        document.body.insertBefore(topPanel, document.querySelector('h1').nextSibling);
        endorseList = document.querySelector('#endorse-list');
        document.querySelector('#refresh-endorse').addEventListener('click', refreshEndorseList);
        document.querySelector('#update-localid').addEventListener('click', manualLocalIdUpdate);
    }

    /*
     * Event Handlers
     */

    async function moveToRegion(e: MouseEvent): Promise<void> {
        e.preventDefault();
        const localId: string = document.querySelector('input[name=localid]').getAttribute('value');
        let formData: FormData = new FormData();
        formData.set('localid', localId);
        formData.set('region_name', currentRegionName);
        formData.set('move_region', '1');
        const response = await makeAjaxQuery('/page=change_region', 'POST', formData);
        if (response.indexOf('is now located') !== -1) {
            moveButton.parentElement.removeChild(moveButton);
            changeRegionForm.innerHTML += `
        <p class="smalltext"><a href="page=change_region">Tired of life in ${pretty(currentRegionName)}?</a>
        </p>
        `;
        } else {
            document.open();
            document.write(response);
            document.close();
        }
    }

    let secondRefreshAfterUpdate = false;
    let secondRoAttempt = false;
    let nationsEndorsed: string[] = [];

    async function actionButtonClick(e: MouseEvent): Promise<void> {
        const value: string = (e.target as HTMLInputElement).value;
        if (value === 'Refresh') {
            const delegateRegex: RegExp = new RegExp('nation=(.+)');
            let officerBoxes = document.querySelectorAll('.officerbox');
            regionalOfficersToDismiss = [];
            for (let i = 0; i !== officerBoxes.length; i++) {
                let quietLink = officerBoxes[i].querySelector('.quietlink');
                if (quietLink === null)
                    continue;
                else if (quietLink.innerHTML.indexOf('Governor') !== -1)
                    continue;
                else if (quietLink.innerHTML.indexOf('WA Delegate') !== -1)
                    continue;
                let officerName = delegateRegex.exec(officerBoxes[i].querySelector('.nlink')
                    .getAttribute('href'))[1];
                regionalOfficersToDismiss.push(officerName);
            }
            const response = await makeAjaxQuery(`/template-overall=none/region=${currentRegionName}`, 'GET');
            const responseElement = document.createRange().createContextualFragment(response);

            let updateTime: string = responseElement.querySelector('#regioncontent > p:nth-child(4) > time').innerHTML;
            let waDelegate: string
            try {
                waDelegate = responseElement.querySelector('#regioncontent > p:nth-child(2) > a > span > span.nname').innerHTML;
            } catch (error) {
                waDelegate = "None";
            }
            console.log(regionalOfficersToDismiss);
            console.log(waDelegate);
            console.log(updateTime);
            if (updateTime.indexOf('hour') === -1) {
                if (secondRefreshAfterUpdate) {
                    chrome.storage.local.get('currentwa', (result) => {
                        console.log(result.currentwa);
                        console.log(waDelegate);
                        if (canonicalize(result.currentwa) === canonicalize(waDelegate)) {
                            regionStatus.innerHTML = 'Updated! You <b>are</b> the delegate.';
                            actionButton.setAttribute('value', 'Dismiss RO');
                        } else {
                            regionStatus.innerHTML = 'Updated! You are <b>not</b> the delegate.';
                            actionButton.setAttribute('value', 'Resign From the WA');
                        }
                    });
                }
                secondRefreshAfterUpdate = true;
            }
        } else if (value === 'Dismiss RO') {
            chrome.storage.local.get('chk', async (result) => {
                if (regionalOfficersToDismiss.length === 0) {
                    actionButton.setAttribute('value', 'Appoint Self as RO');
                    return;
                }
                const chk: string = result.chk;
                let formData = new FormData();
                // Dismiss only one officer at a time
                formData.set('nation', regionalOfficersToDismiss[0]);
                formData.set('page', 'region_control');
                formData.set('region', currentRegionName);
                formData.set('chk', chk);
                formData.set('abolishofficer', '1');
                await makeAjaxQuery(`/page=region_control/region=${currentRegionName}`, 'POST', formData);
                regionalOfficersToDismiss.shift();
            });
        } else if (value === 'Appoint Self as RO') {
            chrome.storage.local.get(['chk', 'roname', 'currentwa'], async (result) => {
                const currentNation = result.currentwa;
                const chk: string = result.chk;
                const roName: string = result.roname;
                let formData = new FormData();
                formData.set('page', 'region_control');
                formData.set('region', currentRegionName);
                formData.set('chk', chk);
                formData.set('nation', currentNation);
                formData.set('office_name', roName);
                formData.set('authority_A', '1');
                formData.set('authority_B', '0');
                formData.set('authority_C', '1');
                formData.set('authority_E', '1');
                formData.set('authority_P', '1');
                formData.set('editofficer', '1');
                const response =
                    await makeAjaxQuery(`/page=region_control/region=${currentRegionName}`, 'POST', formData);
                const responseElement = document.createRange().createContextualFragment(response);
                const responseInfo = responseElement.querySelector('.info') || responseElement.querySelector('.error');
                if (responseInfo.innerHTML.indexOf('with authority') !== -1)
                    regionStatus.innerHTML = 'Successfully self appointed as RO.';
                else {
                    regionStatus.innerHTML = 'Failed to appoint self as RO.';
                    // appointing RO fails sometimes, we don't want to try more than twice
                    if (!secondRoAttempt) {
                        secondRoAttempt = true;
                        return;
                    }
                    console.log(response);
                }
                actionButton.setAttribute('value', 'Resign From the WA');
            });
        } else if (value === 'Resign From the WA') {
            chrome.storage.local.get('chk', async (result) => {
                const chk = result.chk;
                let formData = new FormData();
                formData.set('action', 'leave_UN');
                formData.set('chk', chk);
                const response = await makeAjaxQuery('/page=UN_status', 'POST', formData);
                if (response.indexOf('You inform the World Assembly that') !== -1) {
                    const nationNameRegex = new RegExp('data-nname="([A-Za-z0-9_-]+?)"');
                    const match = nationNameRegex.exec(response);
                    regionStatus.innerHTML = `Resigned from the WA on ${match[1]}`;
                    actionButton.setAttribute('value', 'Admit on Next Switcher');
                    chrome.storage.local.set({'currentwa': ''});
                }
            });
        } else if (value === 'Admit on Next Switcher') {
            chrome.storage.local.get('switchers', async (result) => {
                let switchers: Switcher[] = result.switchers;
                let formData = new FormData();
                formData.set('nation', switchers[0].name);
                formData.set('appid', switchers[0].appid);
                const response = await makeAjaxQuery('/cgi-bin/join_un.cgi', 'POST', formData, true);
                if (response.indexOf('Welcome to the World Assembly, new member') !== -1) {
                    regionStatus.innerHTML = `Admitted to the WA on ${switchers[0].name}`;
                    chrome.storage.local.set({'currentwa': switchers[0].name});
                    // https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
                    /*let copyText = document.createElement('textarea');
                    copyText.value = `https://www.nationstates.net/nation=${switchers[0].name}/template-overall=none`;
                    document.body.appendChild(copyText);
                    copyText.select();
                    document.execCommand('copy');
                    document.body.removeChild(copyText);*/
                    updateChk(response);
                    switchers.shift();
                    chrome.storage.local.set({'switchers': switchers});
                    actionButton.setAttribute('disabled', '');
                } else if (response.indexOf('Another WA member nation is currently using the same email address') !== -1)
                    regionStatus.innerHTML = `Failed to admit on ${switchers[0].name}. A nation is already in the WA.`;
                else {
                    regionStatus.innerHTML = `Failed to admit to the WA on ${switchers[0].name}. Invalid application.`;
                    switchers.shift();
                    chrome.storage.local.set({'switchers': switchers});
                }
            });
        }
    }

    async function refreshEndorseList(e: MouseEvent): Promise<void> {
        endorseList.innerHTML = '';
        let currentNation: string;
        if (!(urlParameters['template-overall']))
            currentNation = document.querySelector('#loggedin').getAttribute('data-nname');
        else {
            currentNation = await new Promise((resolve, reject) => {
                chrome.storage.local.get('currentwa', (result) => {
                    resolve(result.currentwa);
                });
            });
        }

        const apiResponse = await fetchWithRateLimit(`/cgi-bin/api.cgi?q=happenings;view=region.${currentRegionName};filter=move+member+endo`);
        const apiText = await apiResponse.text();
        const happeningsObject = parseApiHappenings(apiText);
        const happeningsText = happeningsObject.text;
        const happeningsTimeStamps = happeningsObject.timestamps;
        const nationNameRegex = new RegExp('@@([A-Za-z0-9_-]+)@@');

        let resigned: string[] = [];
        for (let i = 0; i != happeningsText.length; i++) {
            const nationNameMatch = nationNameRegex.exec(happeningsText[i]);
            const nationName = nationNameMatch[1];
            // don't allow us to endorse ourself
            if (canonicalize(nationName) === canonicalize(currentNation))
                resigned.push(nationName);
            // Don't include nations that probably aren't in the WA
            if (happeningsText[i].indexOf('resigned from') !== -1)
                resigned.push(nationName);
            // don't let us endorse the same nation twice
            else if (nationsEndorsed.indexOf(nationName) !== -1)
                resigned.push(nationName);
            else if (happeningsText[i].indexOf('was admitted') !== -1) {
                if (resigned.indexOf(nationName) === -1) {
                    function onEndorseClick(e: MouseEvent) {
                        chrome.storage.local.get('localid', async (localidresult) => {
                            (e.target as HTMLInputElement).setAttribute('data-clicked', '1');
                            const localId = localidresult.localid;
                            let formData = new FormData();
                            formData.set('nation', nationName);
                            formData.set('localid', localId);
                            formData.set('action', 'endorse');
                            let endorseResponse = await makeAjaxQuery('/cgi-bin/endorse.cgi', 'POST', formData);
                            if (endorseResponse.indexOf('Failed security check.') !== -1) {
                                document.querySelector('#endorse-status').innerHTML = `Failed to endorse ${nationName}.`;
                                console.log(endorseResponse);
                            } else {
                                document.querySelector('#endorse-status').innerHTML = `Endorsed ${nationName}.`;
                                nationsEndorsed.push(nationName);
                                (e.target as HTMLInputElement).parentElement.removeChild(e.target as HTMLInputElement);
                            }
                        });
                    }

                    let endorseButton: Element = document.createElement('input');
                    endorseButton.setAttribute('type', 'button');
                    endorseButton.setAttribute('data-clicked', '0');
                    endorseButton.setAttribute('class', 'ajaxbutton endorse');
                    endorseButton.setAttribute('value', `Endorse ${pretty(nationName)}`);
                    endorseButton.addEventListener('click', onEndorseClick);
                    let endorseLi = document.createElement('li');
                    endorseLi.appendChild(endorseButton);
                    endorseList.appendChild(endorseLi);
                }
            }
        }
    }

    async function manualLocalIdUpdate(e: MouseEvent): Promise<void> {
        document.querySelector('#update-localid').setAttribute('data-clicked', '1');
        const response = await makeAjaxQuery('/region=rwby', 'GET');
        const responseElement = document.createRange().createContextualFragment(response);
        const localId = responseElement.querySelector('input[name=localid]').getAttribute('value');
        chrome.storage.local.set({'localid': localId});
        document.querySelector('#endorse-status').innerHTML = 'Updated localid.';
    }

    function updateChk(page: string): void {
        const pageElement = document.createRange().createContextualFragment(page);
        const chk = pageElement.querySelector('input[name=chk]');
        if (chk)
            chrome.storage.local.set({'chk': chk.getAttribute('value')});
    }

    /*
     * Event Listeners
     */

    actionButton.addEventListener('click', actionButtonClick);
})();