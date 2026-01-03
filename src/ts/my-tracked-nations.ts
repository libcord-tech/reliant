(async () =>
{
    document.querySelector('#content').innerHTML = `<h1>Tracked Nations</h1>
<button id="clear-tracked-nations">Clear Tracked Nations</button>
<div style="margin: 10px 0;">
    <textarea id="import-nations-input" placeholder="Paste nations here (one per line)&#10;Can include full URLs like https://www.nationstates.net/nation=example" rows="5" style="width: 100%; max-width: 500px;"></textarea><br>
    <button id="import-nations">Import Nations</button>
</div>
<table id="tracked-nations"></table>`;
    const trackedNations: string[] = (await getStorageValue('trackednations')) || [];
    trackedNations.forEach((nation, i) => {
        const row: HTMLTableRowElement = document.createElement('tr');
        const cell: HTMLTableCellElement = document.createElement('td');
        cell.innerHTML = `<a target="_blank" href="/nation=${trackedNations[i]}">${trackedNations[i]}</a>`;
        row.appendChild(cell);
        const removeButton: HTMLInputElement = document.createElement('input');
        removeButton.setAttribute('type', 'button');
        removeButton.setAttribute('value', 'Remove');
        removeButton.setAttribute('class', 'button');
        removeButton.addEventListener('click', async (e: MouseEvent) =>
        {
            // Find the correct index at click-time, not at loop-time
            const currentIndex = trackedNations.indexOf(nation);
            if (currentIndex !== -1) {
                trackedNations.splice(currentIndex, 1);
                await chrome.storage.local.set({ trackednations: trackedNations });
                row.remove();
            }
        });
        row.appendChild(removeButton);
        document.querySelector('#tracked-nations').appendChild(row);
    });
    const clearButton: HTMLInputElement = document.querySelector('#clear-tracked-nations');
    clearButton.addEventListener('click', async () =>
    {
        await setStorageValue('trackednations', []);
        document.querySelector('#tracked-nations').innerHTML = '';
        let notyf = new Notyf({
            duration: 3000,
            position: {
                x: 'right',
                y: 'top'
            }
        });
        notyf.success('Cleared tracked nations');
    });

    const importButton: HTMLButtonElement = document.querySelector('#import-nations');
    const importInput: HTMLTextAreaElement = document.querySelector('#import-nations-input');
    importButton.addEventListener('click', async () =>
    {
        const inputText = importInput.value.trim();
        if (!inputText) {
            return;
        }

        const lines = inputText.split('\n');
        const newNations: string[] = [];

        lines.forEach(line => {
            let nation = line.trim();
            if (!nation) return;

            // Remove URL prefix if present
            const urlPrefix = 'https://www.nationstates.net/nation=';
            if (nation.startsWith(urlPrefix)) {
                nation = nation.substring(urlPrefix.length);
            }

            // Add if not already in tracked or new list
            if (nation && !trackedNations.includes(nation) && !newNations.includes(nation)) {
                newNations.push(nation);
            }
        });

        if (newNations.length === 0) {
            let notyf = new Notyf({
                duration: 3000,
                position: {
                    x: 'right',
                    y: 'top'
                }
            });
            notyf.error('No new nations to import');
            return;
        }

        // Add new nations to the list and table
        newNations.forEach(nation => {
            trackedNations.push(nation);

            const row: HTMLTableRowElement = document.createElement('tr');
            const cell: HTMLTableCellElement = document.createElement('td');
            cell.innerHTML = `<a target="_blank" href="/nation=${nation}">${nation}</a>`;
            row.appendChild(cell);
            const removeButton: HTMLInputElement = document.createElement('input');
            removeButton.setAttribute('type', 'button');
            removeButton.setAttribute('value', 'Remove');
            removeButton.setAttribute('class', 'button');
            removeButton.addEventListener('click', async (e: MouseEvent) =>
            {
                const currentIndex = trackedNations.indexOf(nation);
                if (currentIndex !== -1) {
                    trackedNations.splice(currentIndex, 1);
                    await chrome.storage.local.set({ trackednations: trackedNations });
                    row.remove();
                }
            });
            row.appendChild(removeButton);
            document.querySelector('#tracked-nations').appendChild(row);
        });

        await setStorageValue('trackednations', trackedNations);
        importInput.value = '';

        let notyf = new Notyf({
            duration: 3000,
            position: {
                x: 'right',
                y: 'top'
            }
        });
        notyf.success(`Imported ${newNations.length} nation(s)`);
    });
})();