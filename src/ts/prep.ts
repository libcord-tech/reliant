(async () =>
{
    const pageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Reliant - Prep</title>
    <meta charset="utf-8">
</head>
<body>
<div id="container">
    <div id="group-1">
        <div id="switchers-prepped-container">
            <span class="header">Switchers Prepped</span>
            <div class="information">
                <span id="current-switcher-number"></span>
                /
                <span id="max-switchers"></span>
            </div>
        </div>
        <div id="status-container">
            <span class="header">Status</span>
            <span class="information" id="status">N/A</span>
        </div>
        <div id="current-switcher-container">
            <span class="header">Current Switcher</span>
            <input class="ajaxbutton" type="button" id="update" value="Update">
            <span class="information" id="current-switcher">N/A</span>
        </div>
        <div id="prep-button-container">
            <span class="header">Prep</span>
            <input class="ajaxbutton" type="button" id="prep-button" value="Apply">
        </div>
    </div>
</div>
</body>
</html>`;
    document.open();
    document.write(pageContent);
    document.close();

    await dieIfNoUserAgent();

    /*
     * Event Handlers
     */

    async function updateCurrentSwitcher(e: MouseEvent): Promise<void>
    {
        const response = await makeAjaxQuery('/page=un', 'GET');
        const responseElement = document.createRange().createContextualFragment(response);
        const nationNameRegex = new RegExp('data-nname="([A-Za-z0-9_-]+?)"');
        const nationName = nationNameRegex.exec(response)[1];
        (document.querySelector('#current-switcher') as HTMLSpanElement).innerHTML = nationName;
        (document.querySelector('#current-switcher-number') as HTMLSpanElement).innerHTML = String(switchers.indexOf(nationName) + 1);
        chrome.storage.local.set({'chk': (responseElement.querySelector('input[name=chk]') as HTMLInputElement).value});
    }

    function prepButton(e: MouseEvent): void
    {
        const prepButton: HTMLInputElement = document.querySelector('#prep-button');
        let formData = new FormData();
        chrome.storage.local.get('chk', async (result) =>
        {
            if ((e.target as HTMLInputElement).value === 'Apply') {
                formData.set('action', 'join_UN');
                formData.set('chk', result.chk);
                formData.set('submit', '1');
                let response = await makeAjaxQuery('/page=UN_status', 'POST', formData);
                if (response.indexOf('Your application to join the World Assembly has been received') !== -1) {
                    document.querySelector('#status').innerHTML = `Applied on ${document.querySelector('#current-switcher').innerHTML}`;
                    prepButton.value = 'Update Localid';
                }
                else if (response.indexOf('Your World Assembly invitation email, sent to') !== -1) {
                    document.querySelector('#status').innerHTML = 'WA email already sent. Resend.';
                    prepButton.value = 'Reapply';
                }
                else {
                    document.querySelector('#status').innerHTML = `Failed to apply on ${document.querySelector('#current-switcher').innerHTML}`;
                    prepButton.value = 'Update Localid';
                }
            }
            else if ((e.target as HTMLInputElement).value === 'Update Localid') {
                let response = await makeAjaxQuery('/region=rwby', 'GET');
                getLocalId(response);
                document.querySelector('#status').innerHTML = 'Updated localid';
                prepButton.value = 'Move to JP';
            }
            else if ((e.target as HTMLInputElement).value === 'Move to JP') {
                chrome.storage.local.get(['localid', 'jumppoint'], async (result) =>
                {
                    const localId = result.localid;
                    const moveRegion = result.jumppoint;
                    formData.set('localid', localId);
                    formData.set('region_name', moveRegion);
                    formData.set('move_region', '1');
                    let response = await makeAjaxQuery('/page=change_region', 'POST', formData);
                    if (response.indexOf('This request failed a security check.') !== -1)
                        document.querySelector('#status').innerHTML = `Failed to move to ${moveRegion}.`;
                    else {
                        document.querySelector('#status').innerHTML = `Moved to ${moveRegion}`;
                        prepButton.value = 'Login to Next Switcher';
                    }
                });
            }
            else if ((e.target as HTMLInputElement).value === 'Reapply') {
                let response = await makeAjaxQuery(`/page=UN_status/action=join_UN?chk=${result.chk}&amp;resend=1`, 'GET');
                if (response.indexOf('Your application to join the World Assembly has been received') !== -1) {
                    document.querySelector('#status').innerHTML = `Applied on ${document.querySelector('#current-switcher').innerHTML}`;
                }
                prepButton.value = 'Update Localid';
            }
            else if ((e.target as HTMLInputElement).value === 'Login to Next Switcher') {
                chrome.storage.local.get('password', async (result) =>
                {
                    const nextNation = switchers[switchers.indexOf(document.querySelector('#current-switcher').innerHTML) + 1];
                    document.querySelector('#current-switcher-number').innerHTML =
                        String(switchers.indexOf(document.querySelector('#current-switcher').innerHTML) + 1);
                    if (typeof nextNation === 'undefined')
                        return;
                    document.querySelector('#current-switcher').innerHTML = nextNation;
                    // let response = await makeAjaxQuery(`/page=un?nation=${nextNation}&password=${result.password}&logging_in=1`,
                    //     'GET');
                    const formData = new FormData();
                    formData.set('nation', nextNation);
                    formData.set('password', result.password);
                    formData.set('logging_in', '1');
                    let response = await makeAjaxQuery('/page=un', 'POST', formData);
                    getChk(response);
                    prepButton.value = 'Apply';
                });
            }
        });
    }

    /*
     * Event Listeners
     */

    document.querySelector('#update').addEventListener('click', updateCurrentSwitcher);
    document.querySelector('#prep-button').addEventListener('click', prepButton);
    document.addEventListener('keyup', keyPress);

    /*
     * Initialization
     */

    let switchers: string[];

    chrome.storage.local.get('prepswitchers', (result) =>
    {
        switchers = result.prepswitchers;
        document.querySelector('#max-switchers').innerHTML = String(switchers.length);
    });
})();