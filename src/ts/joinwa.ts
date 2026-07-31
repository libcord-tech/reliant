(() =>
{
    function normalizeWhitespace(value: string): string
    {
        return value.normalize('NFKC')
            .replace(/[\u00a0\u202f]/g, ' ')
            .replace(/[\u200e\u200f\u061c]/g, '')
            .replace(/\s+/g, ' ');
    }

    function normalizeText(value: string): string
    {
        return normalizeWhitespace(value).trim();
    }

    function normalizeToken(value: string): string
    {
        return normalizeText(value)
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLocaleLowerCase();
    }

    function escapeRegExp(value: string): string
    {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
    }

    function getLocalizedDigits(locale: string, numberingSystem: string): Map<string, string>
    {
        const digits = new Map<string, string>();
        const formatter = new Intl.NumberFormat(locale, {
            useGrouping: false,
            numberingSystem,
        });
        for (let digit = 0; digit <= 9; digit++)
            digits.set(formatter.format(digit), String(digit));
        return digits;
    }

    function parseLocalizedNumber(value: string, locale: string, numberingSystem: string): number
    {
        const digits = getLocalizedDigits(locale, numberingSystem);
        let asciiValue = value;
        for (const [localizedDigit, asciiDigit] of digits)
            asciiValue = asciiValue.split(localizedDigit).join(asciiDigit);
        return Number(asciiValue.replace(/[^0-9]/g, ''));
    }

    function parseTimestampForLocale(text: string, locale: string): number | null
    {
        const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let formatter: Intl.DateTimeFormat;
        try {
            formatter = new Intl.DateTimeFormat(locale, {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: browserTimeZone,
            });
        } catch {
            return null;
        }

        const resolved = formatter.resolvedOptions();

        // idk how to work with non-gregorian calendars
        if (resolved.calendar !== 'gregory')
            return null;

        const resolvedLocale = resolved.locale;
        const numberingSystem = resolved.numberingSystem;
        const referenceDate = new Date(2026, 6, 8, 13, 5);
        const formatParts = formatter.formatToParts(referenceDate);
        const monthValue = formatParts.find((part) => part.type === 'month')?.value ?? '';
        const monthIsNumeric = /^\p{N}+$/u.test(monthValue);
        const regexParts = formatParts.map((part) =>
        {
            if (part.type === 'literal')
                return escapeRegExp(normalizeWhitespace(part.value));
            if (part.type === 'month' && !monthIsNumeric)
                return '(?<month>.+?)';
            if (part.type === 'day')
                return '(?<day>\\p{N}+)';
            if (part.type === 'month')
                return '(?<month>\\p{N}+)';
            if (part.type === 'year')
                return '(?<year>\\p{N}+)';
            if (part.type === 'hour')
                return '(?<hour>\\p{N}+)';
            if (part.type === 'minute')
                return '(?<minute>\\p{N}+)';
            if (part.type === 'dayPeriod')
                return '(?<dayPeriod>.+?)';
            return escapeRegExp(normalizeText(part.value));
        });

        let match: RegExpMatchArray;
        try {
            match = normalizeText(text).match(new RegExp(`^${regexParts.join('')}$`, 'u'));
        } catch {
            return null;
        }
        if (!match?.groups)
            return null;

        const year = parseLocalizedNumber(match.groups.year, resolvedLocale, numberingSystem);
        const day = parseLocalizedNumber(match.groups.day, resolvedLocale, numberingSystem);
        const hourValue = parseLocalizedNumber(match.groups.hour, resolvedLocale, numberingSystem);
        const minute = parseLocalizedNumber(match.groups.minute, resolvedLocale, numberingSystem);
        if (![year, day, hourValue, minute].every(Number.isFinite))
            return null;

        let month: number;
        if (monthIsNumeric) {
            month = parseLocalizedNumber(match.groups.month, resolvedLocale, numberingSystem) - 1;
        } else {
            const monthNames = new Map<string, number>();
            for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                const monthParts = formatter.formatToParts(new Date(2026, monthIndex, 8, 13, 5));
                const monthName = monthParts.find((part) => part.type === 'month')?.value;
                if (monthName)
                    monthNames.set(normalizeToken(monthName), monthIndex);
            }
            month = monthNames.get(normalizeToken(match.groups.month));
            if (month === undefined)
                return null;
        }

        let hour = hourValue;
        if (match.groups.dayPeriod) {
            const morning = normalizeToken(formatter.formatToParts(new Date(2026, 6, 8, 1, 5))
                .find((part) => part.type === 'dayPeriod')?.value ?? '');
            const afternoon = normalizeToken(formatter.formatToParts(new Date(2026, 6, 8, 13, 5))
                .find((part) => part.type === 'dayPeriod')?.value ?? '');
            const period = normalizeToken(match.groups.dayPeriod);
            if (period === afternoon && hour < 12)
                hour += 12;
            else if (period === morning && hour === 12)
                hour = 0;
        }

        const parsed = new Date(year, month, day, hour, minute);
        if (parsed.getFullYear() !== year || parsed.getMonth() !== month ||
            parsed.getDate() !== day || parsed.getHours() !== hour ||
            parsed.getMinutes() !== minute)
            return null;

        // Check whether it can be reversed back, if not, fail
        if (normalizeText(formatter.format(parsed)) !== normalizeText(text))
            return null;

        return parsed.getTime();
    }

    function getEmailTimestamp(): number | undefined
    {
        const fullDateTexts = [...new Set(
            Array.from(document.querySelectorAll('span.g3 span'))
                .filter((element) => element.getClientRects().length > 0)
                .map((element) => element.parentElement?.getAttribute('title')?.trim() ?? '')
                .filter((text) => /\p{N}{4}/u.test(text))
        )];
        if (fullDateTexts.length !== 1)
            return undefined;

        const gmailLocale = document.documentElement.lang?.trim() || 'en-US';
        const timestamp = parseTimestampForLocale(fullDateTexts[0], gmailLocale);
        return timestamp ?? undefined;
    }

    async function addSwitcher(newSwitcher: Switcher): Promise<void>
    {
        const parsedEmailTimestamp = getEmailTimestamp();
        const storedAt = parsedEmailTimestamp ?? Date.now();

        const result = await new Promise<{ switchers?: Switcher[] }>((resolve) =>
        {
            chrome.storage.local.get('switchers', resolve);
        });
        const storedSwitchers = Array.isArray(result.switchers) ? result.switchers : [];
        const now = Date.now();
        const switchers = storedSwitchers
            .filter((switcher) => switcher && typeof switcher.name === 'string' && typeof switcher.appid === 'string')
            .map((switcher) =>
            {
                const expiresAt = Number(switcher.expiresAt);
                return Number.isFinite(expiresAt) ? switcher :
                    { ...switcher, expiresAt: now + 28 * 24 * 60 * 60 * 1000 };
            })
            .filter((switcher) => Number(switcher.expiresAt) > now);
        if (JSON.stringify(switchers) !== JSON.stringify(storedSwitchers))
            await chrome.storage.local.set({ switchers });

        if (switchers.some((switcher) => switcher.name.trim().toLowerCase().replace(/ /g, '_') ===
            newSwitcher.name.trim().toLowerCase().replace(/ /g, '_')))
            return;

        switchers.push({
            name: newSwitcher.name,
            appid: newSwitcher.appid,
            expiresAt: storedAt + 28 * 24 * 60 * 60 * 1000,
        });
        await chrome.storage.local.set({ switchers });
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
                void addSwitcher(newSwitcher);
            }
        }
    });
})();
