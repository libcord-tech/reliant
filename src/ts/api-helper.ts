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

// Request queue to serialize API calls and prevent race conditions
const requestQueue: Array<() => Promise<any>> = [];
let processingQueue = false;

// Set to track currently disabled buttons to prevent multiple disables
const disabledButtons = new Set<HTMLInputElement>();

// Global flag to disable all ajax buttons during any API request
let apiRequestInProgress = false;

/**
 * Disable all ajax buttons on the page
 */
function disableAllAjaxButtons(): void {
    const ajaxButtons = document.querySelectorAll('.ajaxbutton');
    ajaxButtons.forEach(button => {
        const btn = button as HTMLInputElement;
        if (!btn.disabled) {
            btn.disabled = true;
            btn.setAttribute('data-api-disabled', 'true');
        }
    });
}

/**
 * Re-enable ajax buttons that were disabled by API requests
 */
function enableAllAjaxButtons(): void {
    const ajaxButtons = document.querySelectorAll('.ajaxbutton[data-api-disabled="true"]');
    ajaxButtons.forEach(button => {
        const btn = button as HTMLInputElement;
        btn.disabled = false;
        btn.removeAttribute('data-api-disabled');
    });
}

/**
 * Process the request queue sequentially
 */
async function processRequestQueue(): Promise<void> {
    if (processingQueue || requestQueue.length === 0) {
        return;
    }
    
    processingQueue = true;
    
    while (requestQueue.length > 0) {
        const nextRequest = requestQueue.shift();
        if (nextRequest) {
            try {
                await nextRequest();
            } catch (error) {
                console.error('Error processing queued request:', error);
            }
        }
    }
    
    processingQueue = false;
}

/**
 * Makes a fetch request while respecting the API's rate-limit.
 *
 * @param url - The URL to fetch.
 * @param options - Fetch options (method, headers, body, etc.).
 * @param caller - The HTML element that triggered the fetch request.
 * @returns A Promise resolving to the fetch Response.
 */
async function fetchWithRateLimit(url: string, options: RequestInit = {}, caller: HTMLInputElement = undefined): Promise<Response> {
    // Immediately disable the caller button to prevent spam clicks
    if (caller && !disabledButtons.has(caller)) {
        caller.disabled = true;
        disabledButtons.add(caller);
    }
    
    // Create a promise that will be resolved when this request is processed
    return new Promise<Response>((resolve, reject) => {
        // Add the request to the queue
        requestQueue.push(async () => {
            try {
                const response = await executeRateLimitedFetch(url, options);
                resolve(response);
            } catch (error) {
                reject(error);
            } finally {
                // Re-enable the button after the request completes
                if (caller && disabledButtons.has(caller)) {
                    caller.disabled = false;
                    disabledButtons.delete(caller);
                }
            }
        });
        
        // Start processing the queue
        processRequestQueue();
    });
}

/**
 * Internal function that actually executes the rate-limited fetch
 */
async function executeRateLimitedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Disable all ajax buttons at the start of the request
    if (!apiRequestInProgress) {
        apiRequestInProgress = true;
        disableAllAjaxButtons();
    }
    
    try {
        // --- 1. Check if we are still within a rate-limited window with no remaining calls
        if (Date.now() < rateLimitResetTime && rateLimitRemaining <= 0) {
            // We are in the middle of a window but have used up all requests; wait for reset
            const waitMs = rateLimitResetTime - Date.now();
            console.warn(`Hit rate-limit capacity. Waiting for ${waitMs}ms until window resets...`);
            await sleep(waitMs);
        }
        
        // --- 2. Preemptively decrement remaining count to prevent race conditions
        // This ensures that concurrent requests can't all see the same "remaining" value
        rateLimitRemaining = Math.max(0, rateLimitRemaining - 1);

        // --- 3. Make the request
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
            return executeRateLimitedFetch(url, options);
        }

        // --- 4. Update local rate-limit tracking from the headers
        // (Do not rely on hardcoded values; use the returned RateLimit-* headers)
        const limitHeader = response.headers.get("RateLimit-Limit");
        const remainingHeader = response.headers.get("RateLimit-Remaining");
        const resetHeader = response.headers.get("RateLimit-Reset");

        if (limitHeader) {
            rateLimitLimit = parseInt(limitHeader, 10) || rateLimitLimit;
        }
        if (remainingHeader) {
            // Use the server's authoritative remaining count
            rateLimitRemaining = parseInt(remainingHeader, 10) || 0;
        }
        if (resetHeader) {
            // The RateLimit-Reset header tells us how many seconds until the bucket resets.
            // Convert it to a timestamp (ms since epoch).
            const resetInSeconds = parseInt(resetHeader, 10) || 0;
            rateLimitResetTime = Date.now() + resetInSeconds * 1000;
        }

        // --- 5. Return the response
        return response;
    } finally {
        // Check if this was the last request in the queue
        if (requestQueue.length === 0) {
            apiRequestInProgress = false;
            enableAllAjaxButtons();
        }
    }
}