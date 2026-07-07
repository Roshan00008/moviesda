/**
 * Moviesda Nuvio Addon - Compiled
 * Generated: 2026-07-07T15:19:51.900Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/moviesda/index.js
var import_cheerio_without_node_native2 = __toESM(require("cheerio-without-node-native"));

// src/moviesda/http.js
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};
function fetchText(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    console.log(`[Moviesda] Fetching Page: ${url}`);
    const response = yield fetch(url, __spreadValues({
      headers: __spreadValues(__spreadValues({}, HEADERS), options.headers)
    }, options));
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: Failed to load ${url}`);
    }
    return yield response.text();
  });
}
function fetchJson(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    const response = yield fetch(url, __spreadValues({
      headers: __spreadValues({
        "Accept": "application/json"
      }, options.headers)
    }, options));
    if (!response.ok) {
      throw new Error(`API Error ${response.status}: Failed to fetch ${url}`);
    }
    return yield response.json();
  });
}

// src/moviesda/extractor.js
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));
var BASE_URL = "https://moviesda30.com";
function resolveUrl(url) {
  if (!url)
    return "";
  if (url.startsWith("http"))
    return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}
function getDirectMp4Url(downloadPageUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(resolveUrl(downloadPageUrl));
      const $ = import_cheerio_without_node_native.default.load(html);
      const directUrls = [];
      $("a").each((_, el) => {
        const href = $(el).attr("href");
        const label = $(el).text().trim();
        if (href && (href.includes(".mp4") || href.includes("cdnserver"))) {
          directUrls.push({
            url: href,
            title: label || "Download Server Direct"
          });
        }
      });
      return directUrls;
    } catch (e) {
      console.error(`[Moviesda] Stage 6 error for ${downloadPageUrl}: ${e.message}`);
      return [];
    }
  });
}
function getFinalRedirectPage(filePageUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(resolveUrl(filePageUrl));
      const $ = import_cheerio_without_node_native.default.load(html);
      const redirectUrls = [];
      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("downloadpage.xyz/download/page/")) {
          redirectUrls.push(href);
        }
      });
      return redirectUrls;
    } catch (e) {
      console.error(`[Moviesda] Stage 5 error for ${filePageUrl}: ${e.message}`);
      return [];
    }
  });
}
function getIntermediateServerUrls(resolutionPageUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(resolveUrl(resolutionPageUrl));
      const $ = import_cheerio_without_node_native.default.load(html);
      const serverUrls = [];
      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("moviespage.xyz/download/file/")) {
          serverUrls.push(href);
        }
      });
      return serverUrls;
    } catch (e) {
      console.error(`[Moviesda] Stage 4 error for ${resolutionPageUrl}: ${e.message}`);
      return [];
    }
  });
}
function getDownloadSelectionUrls(subfolderUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(resolveUrl(subfolderUrl));
      const $ = import_cheerio_without_node_native.default.load(html);
      const selectionUrls = [];
      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.startsWith("/download/")) {
          selectionUrls.push(href);
        }
      });
      return selectionUrls;
    } catch (e) {
      console.error(`[Moviesda] Stage 3 error for ${subfolderUrl}: ${e.message}`);
      return [];
    }
  });
}
function getResolutionSubfolders(folderUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(resolveUrl(folderUrl));
      const $ = import_cheerio_without_node_native.default.load(html);
      const subfolders = [];
      $("div.f, div.folder").each((_, el) => {
        const a = $(el).find("a").first();
        const href = a.attr("href");
        const text = a.text().trim();
        if (href && (href.includes("hd-movie") || text.includes("HD") || text.includes("p"))) {
          let quality = "HD";
          if (text.includes("1080p"))
            quality = "1080p";
          else if (text.includes("720p"))
            quality = "720p";
          else if (text.includes("360p"))
            quality = "360p";
          subfolders.push({
            url: href,
            quality,
            label: text
          });
        }
      });
      return subfolders;
    } catch (e) {
      console.error(`[Moviesda] Stage 2 error for ${folderUrl}: ${e.message}`);
      return [];
    }
  });
}
function getMovieFolders(moviePageUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(resolveUrl(moviePageUrl));
      const $ = import_cheerio_without_node_native.default.load(html);
      const folderUrls = [];
      $("div.f, div.folder").each((_, el) => {
        const a = $(el).find("a").first();
        const href = a.attr("href");
        const text = a.text().trim();
        if (!href)
          return;
        if (href.includes("-movies/") || href.includes("collections/") || href.includes("isaidub") || href.includes("request"))
          return;
        folderUrls.push({
          url: href,
          label: text
        });
      });
      return folderUrls;
    } catch (e) {
      console.error(`[Moviesda] Stage 1 error for ${moviePageUrl}: ${e.message}`);
      return [];
    }
  });
}
function scrapeMovieStreams(moviePageUrl, movieTitle) {
  return __async(this, null, function* () {
    const streams = [];
    console.log(`[Moviesda] Initiating extraction pipeline for: ${moviePageUrl}`);
    const folders = yield getMovieFolders(moviePageUrl);
    console.log(`[Moviesda] Found ${folders.length} movie folders.`);
    for (const folder of folders) {
      const resolutions = yield getResolutionSubfolders(folder.url);
      console.log(`[Moviesda] Found ${resolutions.length} resolutions under folder "${folder.label}".`);
      for (const res of resolutions) {
        const downloadSelections = yield getDownloadSelectionUrls(res.url);
        console.log(`[Moviesda] Found ${downloadSelections.length} download files for quality: ${res.quality}`);
        for (const selection of downloadSelections) {
          const intermediateServers = yield getIntermediateServerUrls(selection);
          for (const serverUrl of intermediateServers) {
            const finalPages = yield getFinalRedirectPage(serverUrl);
            for (const finalPage of finalPages) {
              const directUrls = yield getDirectMp4Url(finalPage);
              for (const direct of directUrls) {
                streams.push({
                  name: "Moviesda",
                  title: `${movieTitle} (${res.quality}) - Server ${streams.length + 1}`,
                  url: direct.url,
                  quality: res.quality,
                  headers: {
                    "User-Agent": HEADERS["User-Agent"],
                    "Referer": "https://movies.downloadpage.xyz/"
                  }
                });
              }
            }
          }
        }
      }
    }
    return streams;
  });
}

// src/moviesda/index.js
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var BASE_URL2 = "https://moviesda30.com";
var SUPPORTED_CATEGORY_YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2012"];
function cleanTitle(title) {
  if (!title)
    return "";
  return title.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}
function findMovieByYearCategory(title, year) {
  return __async(this, null, function* () {
    if (!year || !SUPPORTED_CATEGORY_YEARS.includes(year.toString())) {
      console.log(`[Moviesda] Year ${year} is not in structured category years. Skipping Method 1.`);
      return null;
    }
    const categoryUrl = `${BASE_URL2}/tamil-${year}-movies/`;
    console.log(`[Moviesda] Method 1: Scanning category index: ${categoryUrl}`);
    const cleanedSearchTitle = cleanTitle(title);
    for (let pageNum = 1; pageNum <= 3; pageNum++) {
      try {
        const url = pageNum === 1 ? categoryUrl : `${categoryUrl}?page=${pageNum}`;
        const html = yield fetchText(url);
        const $ = import_cheerio_without_node_native2.default.load(html);
        let matchedHref = null;
        $("div.f a, div.folder a").each((_, el) => {
          if (matchedHref)
            return;
          const href = $(el).attr("href");
          const text = $(el).text();
          if (href && (href.includes("-movie") || href.includes("-series") || href.split("/").filter(Boolean).length === 1)) {
            const yearMatch = text.match(/\((\d{4})\)/);
            const entryYear = yearMatch ? yearMatch[1] : null;
            if (entryYear && year && entryYear.toString() !== year.toString()) {
              return;
            }
            const cleanedEntryTitle = cleanTitle(text.split("(")[0]);
            if (cleanedEntryTitle === cleanedSearchTitle || cleanedEntryTitle.includes(cleanedSearchTitle) || cleanedSearchTitle.includes(cleanedEntryTitle)) {
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
  });
}
function findMovieByAZIndex(title, year) {
  return __async(this, null, function* () {
    const cleanedSearchTitle = cleanTitle(title);
    let firstChar = cleanedSearchTitle.charAt(0);
    let letter = "a";
    if (/[a-z]/.test(firstChar)) {
      letter = firstChar;
    } else {
      letter = "0-9";
    }
    const azUrl = `${BASE_URL2}/tamil-movies/${letter}/`;
    console.log(`[Moviesda] Method 2: Scanning A-Z Index for letter (${letter.toUpperCase()}): ${azUrl}`);
    for (let pageNum = 1; pageNum <= 3; pageNum++) {
      try {
        const url = pageNum === 1 ? azUrl : `${azUrl}?page=${pageNum}`;
        const html = yield fetchText(url);
        const $ = import_cheerio_without_node_native2.default.load(html);
        let matchedHref = null;
        $("div.f a, div.folder a").each((_, el) => {
          if (matchedHref)
            return;
          const href = $(el).attr("href");
          const text = $(el).text();
          if (href) {
            const yearMatch = text.match(/\((\d{4})\)/);
            const entryYear = yearMatch ? yearMatch[1] : null;
            if (entryYear && year && entryYear.toString() !== year.toString()) {
              return;
            }
            const cleanedEntryTitle = cleanTitle(text.split("(")[0]);
            if (cleanedEntryTitle === cleanedSearchTitle || cleanedEntryTitle.includes(cleanedSearchTitle) || cleanedSearchTitle.includes(cleanedEntryTitle)) {
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
  });
}
function searchMovieDuckDuckGo(title, year) {
  return __async(this, null, function* () {
    const query = `site:moviesda30.com ${title} ${year || ""}`.trim();
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    console.log(`[Moviesda] Method 3: DuckDuckGo search fallback: ${searchUrl}`);
    try {
      const html = yield fetchText(searchUrl);
      const $ = import_cheerio_without_node_native2.default.load(html);
      let matchedHref = null;
      const cleanedSearchTitle = cleanTitle(title);
      $("a.result__snippet").each((_, el) => {
        if (matchedHref)
          return;
        const rawUrl = $(el).attr("href") || "";
        const urlMatch = rawUrl.match(/uddg=(.*?)(?:&|$)/);
        if (!urlMatch)
          return;
        const destUrl = decodeURIComponent(urlMatch[1]);
        if (destUrl.includes("moviesda30.com")) {
          const slug = destUrl.split("/").filter(Boolean).pop();
          const yearMatch = slug.match(/-(\d{4})/);
          const entryYear = yearMatch ? yearMatch[1] : null;
          if (entryYear && year && entryYear.toString() !== year.toString()) {
            return;
          }
          const cleanedSlug = slug.replace(/-\d{4}/g, "").replace(/-/g, " ");
          if (cleanTitle(cleanedSlug).includes(cleanedSearchTitle)) {
            matchedHref = destUrl;
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
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log(`[Moviesda] Request received: ${mediaType} TMDB:${tmdbId}`);
      if (mediaType !== "movie") {
        console.log("[Moviesda] TV Series are currently unsupported. Skipping.");
        return [];
      }
      const tmdbUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`;
      const mediaInfo = yield fetchJson(tmdbUrl);
      const title = mediaInfo.title || mediaInfo.original_title;
      const releaseYear = mediaInfo.release_date ? mediaInfo.release_date.split("-")[0] : null;
      if (!title) {
        console.error("[Moviesda] Failed to fetch title from TMDB.");
        return [];
      }
      console.log(`[Moviesda] Resolved TMDB: "${title}" (${releaseYear})`);
      let moviePageUrl = null;
      moviePageUrl = yield findMovieByYearCategory(title, releaseYear);
      if (!moviePageUrl) {
        moviePageUrl = yield findMovieByAZIndex(title, releaseYear);
      }
      if (!moviePageUrl) {
        moviePageUrl = yield searchMovieDuckDuckGo(title, releaseYear);
      }
      if (!moviePageUrl) {
        console.warn(`[Moviesda] Movie "${title}" not found on Moviesda.`);
        return [];
      }
      const streams = yield scrapeMovieStreams(moviePageUrl, title);
      console.log(`[Moviesda] Successfully extracted ${streams.length} stream(s) for "${title}".`);
      return streams;
    } catch (error) {
      console.error(`[Moviesda] Core getStreams failed: ${error.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
