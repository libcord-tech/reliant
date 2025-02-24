// A small helper to pause execution for `ms` milliseconds
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Global/shared variables for the rate-limit state.
 * These are updated after each API response.
 */
let rateLimitLimit = 50;       // The total number of allowed requests in the window
let rateLimitRemaining = 50;   // How many requests remain in the current window
let rateLimitResetTime = 0;    // When the current rate-limit window resets (in ms since epoch)

/**
 * Makes a fetch request while respecting the API's rate-limit.
 *
 * @param url - The URL to fetch.
 * @param options - Fetch options (method, headers, body, etc.).
 * @returns A Promise resolving to the fetch Response.
 */
async function fetchWithRateLimit(url: string, options: RequestInit = {}): Promise<Response> {
    // --- 1. Check if we are still within a rate-limited window with no remaining calls
    if (Date.now() < rateLimitResetTime && rateLimitRemaining <= 0) {
        // We are in the middle of a window but have used up all requests; wait for reset
        const waitMs = rateLimitResetTime - Date.now();
        console.warn(`Hit rate-limit capacity. Waiting for ${waitMs}ms until window resets...`);
        await sleep(waitMs);
    }

    // --- 2. Make the request
    let response = await fetch(url, options);

    // If the server returns HTTP 429, we must wait the "Retry-After" duration
    if (response.status === 429) {
        const retryAfterHeader = response.headers.get("Retry-After");
        if (retryAfterHeader) {
            const retryAfterSeconds = parseInt(retryAfterHeader, 10) || 0;
            const waitMs = retryAfterSeconds * 1000;
            console.warn(`Received 429. Waiting for ${waitMs}ms before retrying...`);
            await sleep(waitMs);
        }

        // Retry the same request after waiting
        return fetchWithRateLimit(url, options);
    }

    // --- 3. Update local rate-limit tracking from the headers
    // (Do not rely on hardcoded values; use the returned RateLimit-* headers)
    const limitHeader = response.headers.get("RateLimit-Limit");
    const remainingHeader = response.headers.get("RateLimit-Remaining");
    const resetHeader = response.headers.get("RateLimit-Reset");

    if (limitHeader) {
        rateLimitLimit = parseInt(limitHeader, 10) || rateLimitLimit;
    }
    if (remainingHeader) {
        rateLimitRemaining = parseInt(remainingHeader, 10) || rateLimitRemaining;
    }
    if (resetHeader) {
        // The RateLimit-Reset header tells us how many seconds until the bucket resets.
        // Convert it to a timestamp (ms since epoch).
        const resetInSeconds = parseInt(resetHeader, 10) || 0;
        rateLimitResetTime = Date.now() + resetInSeconds * 1000;
    }

    // --- 4. Return the response (or you could also parse JSON here)
    return response;
}