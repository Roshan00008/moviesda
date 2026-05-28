/**
 * HTTP helper module for Nuvio providers.
 */

export const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9"
};

/**
 * Fetch raw text from a URL
 * @param {string} url 
 * @param {object} options 
 */
export async function fetchText(url, options = {}) {
    console.log(`[Moviesda] Fetching Page: ${url}`);
    
    const response = await fetch(url, {
        headers: {
            ...HEADERS,
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: Failed to load ${url}`);
    }

    return await response.text();
}

/**
 * Fetch JSON from a TMDB or other API
 * @param {string} url 
 * @param {object} options 
 */
export async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            "Accept": "application/json",
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        throw new Error(`API Error ${response.status}: Failed to fetch ${url}`);
    }

    return await response.json();
}
