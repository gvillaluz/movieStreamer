/*
 * "Continue watching" storage.
 *
 * The video plays inside a third-party iframe, so the only way to know how far someone got is
 * the progress events the embed posts to the page (window.postMessage). Entries are kept in
 * localStorage, one per title, and removed once the title is (nearly) finished.
 */

const STORAGE_KEY = "continue_watching";
const MAX_ENTRIES = 20;
// Every title played, finished or not, for the home page's "Since you watched" rows
const LOG_KEY = "watch_log";
const MAX_LOG = 10;
const MIN_SECONDS = 10;      // ignore the first few seconds: probably an accidental click
const FINISHED_RATIO = 0.95; // past this the title counts as watched

// Embed origins we trust progress events from
export const PLAYER_ORIGINS = ["https://vidlink.pro", "https://vidfast.vc", "https://vidfast.pro", "https://vsembed.ru"];

const readList = (key) => {
    try {
        const list = JSON.parse(localStorage.getItem(key));
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
};

const writeList = (key, list, max) => {
    try {
        localStorage.setItem(key, JSON.stringify(list.slice(0, max)));
    } catch { /* storage full or unavailable: history just isn't saved */ }
};

const read = () => readList(STORAGE_KEY);
const write = (list) => writeList(STORAGE_KEY, list, MAX_ENTRIES);

const sameTitle = (entry, id, category) => String(entry.id) === String(id) && entry.category === category;

/** Unfinished titles, most recently watched first. */
export const getContinueWatching = () =>
    read()
        .filter((e) => e && e.id && e.duration > 0 && e.time > 0)
        .sort((a, b) => b.updatedAt - a.updatedAt);

export const getEntry = (id, category) => read().find((e) => sameTitle(e, id, category)) ?? null;

export const removeEntry = (id, category) => write(read().filter((e) => !sameTitle(e, id, category)));

const logWatched = ({ id, category, title, poster_path }) => {
    const entry = { id, category, title, poster_path, updatedAt: Date.now() };
    writeList(LOG_KEY, [entry, ...readList(LOG_KEY).filter((e) => !sameTitle(e, id, category))], MAX_LOG);
};

/** Titles played recently, finished or not, newest first (one entry per title). */
export const getRecentlyWatched = () => {
    const byTitle = new Map();
    for (const e of [...readList(LOG_KEY), ...read()]) {
        if (!e?.id || !e.category || !e.title) continue;
        const key = `${e.category}-${e.id}`;
        if (!byTitle.has(key) || byTitle.get(key).updatedAt < e.updatedAt) byTitle.set(key, e);
    }
    return [...byTitle.values()].sort((a, b) => b.updatedAt - a.updatedAt);
};

/** Save (or drop, if finished) the playback position of a title. */
export const recordProgress = ({ id, category, title, poster_path, season, episode, time, duration, ended }) => {
    if (!id || !(duration > 0) || !(time >= 0)) return;

    const finished = ended || time / duration >= FINISHED_RATIO;
    if (!finished && time < MIN_SECONDS) return;

    logWatched({ id, category, title, poster_path });
    if (finished) {
        removeEntry(id, category);
        return;
    }

    const entry = {
        id,
        category,
        title,
        poster_path,
        season: category === "tv" ? season : undefined,
        episode: category === "tv" ? episode : undefined,
        time: Math.floor(time),
        duration: Math.floor(duration),
        updatedAt: Date.now(),
    };
    write([entry, ...read().filter((e) => !sameTitle(e, id, category))]);
};

const toNumber = (value) => {
    if (value === null || value === "") return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
};

/**
 * Normalise a window "message" event from an embed provider.
 * Returns null for anything that isn't a trusted player progress event.
 *   VidLink and VidFast (same shape):  { type: "PLAYER_EVENT", data: { event, currentTime, duration, mtmdbId, mediaType, season, episode } }
 *   vsembed:   { type: "PLAYER_EVENT", data: { player_status, player_progress, player_duration, player_info: {...} } }
 */
export const parsePlayerMessage = (event) => {
    if (!PLAYER_ORIGINS.includes(event.origin)) return null;

    let msg = event.data;
    if (typeof msg === "string") {
        try { msg = JSON.parse(msg); } catch { return null; }
    }
    if (!msg || typeof msg !== "object") return null;

    if (msg.type !== "PLAYER_EVENT" || typeof msg.data !== "object" || !msg.data) return null;

    const d = msg.data;
    if (d.player_status !== undefined) {
        const info = d.player_info ?? {};
        return {
            tmdbId: info.tmdb ?? info.tmdbId,
            mediaType: info.mediaType,
            season: toNumber(info.season),
            episode: toNumber(info.episode),
            time: toNumber(d.player_progress),
            duration: toNumber(d.player_duration),
            ended: d.player_status === "completed",
        };
    }

    return {
        tmdbId: d.mtmdbId ?? d.tmdbId ?? d.id,
        mediaType: d.mediaType,
        season: toNumber(d.season),
        episode: toNumber(d.episode),
        time: toNumber(d.currentTime),
        duration: toNumber(d.duration),
        ended: d.event === "ended",
    };
};
