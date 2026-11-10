/*
 * "Continue watching" storage.
 *
 * The video plays inside a third-party iframe, so the only way to know how far someone got is
 * the progress events the embed posts to the page (window.postMessage). Entries are kept in
 * localStorage, one per title, and removed once the title is (nearly) finished.
 */

const STORAGE_KEY = "continue_watching";
const MAX_ENTRIES = 20;
const MIN_SECONDS = 10;      // ignore the first few seconds: probably an accidental click
const FINISHED_RATIO = 0.95; // past this the title counts as watched

// Embed origins we trust progress events from
export const PLAYER_ORIGINS = ["https://vidlink.pro", "https://vidfast.vc", "https://vidfast.pro", "https://vsembed.ru"];

const read = () => {
    try {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
};

const write = (list) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
    } catch { /* storage full or unavailable: progress just isn't saved */ }
};

const sameTitle = (entry, id, category) => String(entry.id) === String(id) && entry.category === category;

/** Unfinished titles, most recently watched first. */
export const getContinueWatching = () =>
    read()
        .filter((e) => e && e.id && e.duration > 0 && e.time > 0)
        .sort((a, b) => b.updatedAt - a.updatedAt);

export const getEntry = (id, category) => read().find((e) => sameTitle(e, id, category)) ?? null;

export const removeEntry = (id, category) => write(read().filter((e) => !sameTitle(e, id, category)));

/** Save (or drop, if finished) the playback position of a title. */
export const recordProgress = ({ id, category, title, poster_path, season, episode, time, duration, ended }) => {
    if (!id || !(duration > 0) || !(time >= 0)) return;

    if (ended || time / duration >= FINISHED_RATIO) {
        removeEntry(id, category);
        return;
    }
    if (time < MIN_SECONDS) return;

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
 * Normalise a window "message" event from either embed provider.
 * Returns null for anything that isn't a trusted player progress event.
 *   VidLink and VidFast (same shape):  { type: "PLAYER_EVENT", data: { event, currentTime, duration, mtmdbId, mediaType, season, episode } }
 *   vsembed:  { type: "PLAYER_EVENT", data: { player_status, player_progress, player_duration, player_info: {...} } }
 */
export const parsePlayerMessage = (event) => {
    if (!PLAYER_ORIGINS.includes(event.origin)) return null;

    let msg = event.data;
    if (typeof msg === "string") {
        try { msg = JSON.parse(msg); } catch { return null; }
    }
    if (!msg || msg.type !== "PLAYER_EVENT" || typeof msg.data !== "object" || !msg.data) return null;

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
