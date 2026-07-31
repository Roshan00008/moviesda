import cheerio from 'cheerio-without-node-native';
import { fetchText, fetchJson } from './http.js';
import { scrapeMovieStreams } from './extractor.js';

const TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
const BASE_URL = "https://moviesda34.com";

// Years that have their own category pages on Moviesda homepage
const SUPPORTED_CATEGORY_YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2012"];

/**
 * Normalizes title strings for reliable comparison
 */
function cleanTitle(title) {
    if (!title) return "";
    return title.toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Method 1: Scan Year Category Index Pages (for recent years)
 */
async function findMovieByYearCategory(title, year) {
    if (!year || !SUPPORTED_CATEGORY_YEARS.includes(year.toString())) {
        console.log(`[Moviesda] Year ${year} is not in structured category years. Skipping Method 1.`);
        return null;
    }
    
    const categoryUrl = `${BASE_URL}/tamil-${year}-movies/`;
    console.log(`[Moviesda] Method 1: Scanning category index: ${categoryUrl}`);
    
    const cleanedSearchTitle = cleanTitle(title);
    
    for (let pageNum = 1; pageNum <= 3; pageNum++) {
        try {
            const url = pageNum === 1 ? categoryUrl : `${categoryUrl}?page=${pageNum}`;
            const html = await fetchText(url);
            const $ = cheerio.load(html);
            
            let matchedHref = null;
            
            $('div.f a, div.folder a').each((_, el) => {
                if (matchedHref) return;
                
                const href = $(el).attr('href');
                const text = $(el).text();
                
                if (href && (href.includes('-movie') || href.includes('-series') || href.split('/').filter(Boolean).length === 1)) {
                    const yearMatch = text.match(/\((\d{4})\)/);
                    const entryYear = yearMatch ? yearMatch[1] : null;
                    
                    if (entryYear && year && entryYear.toString() !== year.toString()) {
                        return; // Year mismatch, skip entry
                    }

                    const cleanedEntryTitle = cleanTitle(text.split('(')[0]);
                    
                    if (cleanedEntryTitle === cleanedSearchTitle || 
                        cleanedEntryTitle.includes(cleanedSearchTitle) || 
                        cleanedSearchTitle.includes(cleanedEntryTitle)) {
                        matchedHref = href;
                    }
                }
            });
            
            if (matchedHref) {
                console.log(`[Moviesda] Movie found in Category Page ${pageNum}: ${matchedHref}`);
                return matchedHref;
            }
        } catch (e) {
            console.warn(`[Moviesda] Year category scanning failed on page ${pageNum}: ${e.message}`);
            break;
        }
    }
    
    return null;
}

/**
 * Method 2: Scan A-Z Alphabetical Index Pages (highly reliable for older movies)
 */
async function findMovieByAZIndex(title, year) {
    const cleanedSearchTitle = cleanTitle(title);
    let firstChar = cleanedSearchTitle.charAt(0);
    
    // Determine the letter folder
    let letter = 'a';
    if (/[a-z]/.test(firstChar)) {
        letter = firstChar;
    } else {
        // Fallback for numbers or other characters
        letter = '0-9'; 
    }
    
    const azUrl = `${BASE_URL}/tamil-movies/${letter}/`;
    console.log(`[Moviesda] Method 2: Scanning A-Z Index for letter (${letter.toUpperCase()}): ${azUrl}`);
    
    for (let pageNum = 1; pageNum <= 6; pageNum++) {
        try {
            const url = pageNum === 1 ? azUrl : `${azUrl}?page=${pageNum}`;
            const html = await fetchText(url);
            const $ = cheerio.load(html);
            
            let matchedHref = null;
            
            $('div.f a, div.folder a').each((_, el) => {
                if (matchedHref) return;
                
                const href = $(el).attr('href');
                const text = $(el).text();
                
                if (href) {
                    const yearMatch = text.match(/\((\d{4})\)/);
                    const entryYear = yearMatch ? yearMatch[1] : null;
                    
                    if (entryYear && year && entryYear.toString() !== year.toString()) {
                        return; // Year mismatch, skip entry
                    }

                    const cleanedEntryTitle = cleanTitle(text.split('(')[0]);
                    
                    if (cleanedEntryTitle === cleanedSearchTitle || 
                        cleanedEntryTitle.includes(cleanedSearchTitle) || 
                        cleanedSearchTitle.includes(cleanedEntryTitle)) {
                        matchedHref = href;
                    }
                }
            });
            
            if (matchedHref) {
                console.log(`[Moviesda] Movie found in A-Z Page ${pageNum}: ${matchedHref}`);
                return matchedHref;
            }
        } catch (e) {
            console.warn(`[Moviesda] A-Z scanning failed on page ${pageNum}: ${e.message}`);
            break;
        }
    }
    
    return null;
}

/**
 * Method 3: Fallback DuckDuckGo HTML Search
 */
async function searchMovieDuckDuckGo(title, year) {
    const query = `site:moviesda34.com ${title} ${year || ''}`.trim();
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    console.log(`[Moviesda] Method 3: DuckDuckGo search fallback: ${searchUrl}`);
    
    try {
        const html = await fetchText(searchUrl);
        const $ = cheerio.load(html);
        
        let matchedHref = null;
        const cleanedSearchTitle = cleanTitle(title);
        
        $('a.result__snippet').each((_, el) => {
            if (matchedHref) return;
            
            const rawUrl = $(el).attr('href') || "";
            const urlMatch = rawUrl.match(/uddg=(.*?)(?:&|$)/);
            if (!urlMatch) return;
            
            const destUrl = decodeURIComponent(urlMatch[1]);
            
            if (destUrl.includes('moviesda') && destUrl.includes('.com')) {
                const normalizedUrl = destUrl.replace(/moviesda\d+\.com/g, 'moviesda34.com');
                const slug = normalizedUrl.split('/').filter(Boolean).pop();
                const yearMatch = slug.match(/-(\d{4})/);
                const entryYear = yearMatch ? yearMatch[1] : null;
                
                if (entryYear && year && entryYear.toString() !== year.toString()) {
                    return; // Skip mismatch
                }

                const cleanedSlug = slug.replace(/-\d{4}/g, '').replace(/-/g, ' ');
                
                if (cleanTitle(cleanedSlug).includes(cleanedSearchTitle)) {
                    matchedHref = normalizedUrl;
                }
            }
        });
        
        if (matchedHref) {
            console.log(`[Moviesda] Movie found via DuckDuckGo search: ${matchedHref}`);
            return matchedHref;
        }
    } catch (e) {
        console.error(`[Moviesda] DuckDuckGo search fallback failed: ${e.message}`);
    }
    
    return null;
}

/**
 * Core Nuvio Provider getStreams Implementation
 */
async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        console.log(`[Moviesda] Request received: ${mediaType} TMDB:${tmdbId}`);
        
        if (mediaType !== 'movie') {
            console.log('[Moviesda] TV Series are currently unsupported. Skipping.');
            return [];
        }
        
        // Get Title from TMDB
        const tmdbUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`;
        const mediaInfo = await fetchJson(tmdbUrl);
        
        const title = mediaInfo.title || mediaInfo.original_title;
        const releaseYear = mediaInfo.release_date ? mediaInfo.release_date.split('-')[0] : null;
        
        if (!title) {
            console.error('[Moviesda] Failed to fetch title from TMDB.');
            return [];
        }
        
        console.log(`[Moviesda] Resolved TMDB: "${title}" (${releaseYear})`);
        
        let moviePageUrl = null;
        
        // 1. Try Method 1: Scanning year category folders (fastest)
        moviePageUrl = await findMovieByYearCategory(title, releaseYear);
        
        // 2. Try Method 2: Scanning A-Z index (highly reliable fallback)
        if (!moviePageUrl) {
            moviePageUrl = await findMovieByAZIndex(title, releaseYear);
        }
        
        // 3. Try Method 3: DuckDuckGo search fallback
        if (!moviePageUrl) {
            moviePageUrl = await searchMovieDuckDuckGo(title, releaseYear);
        }
        
        if (!moviePageUrl) {
            console.warn(`[Moviesda] Movie "${title}" not found on Moviesda.`);
            return [];
        }
        
        // Resolve direct playable stream links
        const streams = await scrapeMovieStreams(moviePageUrl, title);
        console.log(`[Moviesda] Successfully extracted ${streams.length} stream(s) for "${title}".`);
        
        return streams;
    } catch (error) {
        console.error(`[Moviesda] Core getStreams failed: ${error.message}`);
        return [];
    }
}

module.exports = { getStreams };
