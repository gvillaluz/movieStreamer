import { useCallback, useEffect, useRef, useState } from "react";
import { loadContentPage } from "../services/serviceAPI";
import { isComingSoon } from "../utils/releaseStatus";
import { matchesGenre } from "../utils/filters";

const TMDB_PAGE_SIZE = 20;
const TMDB_MAX_PAGE = 500; // TMDB refuses page numbers above this

/** Only titles a poster card can show, so every batch is `batchSize` visible cards. */
const isListable = (item) => Boolean(
    item?.poster_path &&
    (item.release_date || item.first_air_date) &&
    (item.title || item.name)
);

const newCursor = () => ({
    nextPage: 1,
    totalPages: TMDB_MAX_PAGE, // narrowed by the first response
    buffer: [],                // fetched but not shown yet (TMDB pages are 20, batches are `batchSize`)
    seen: new Set(),           // popular rankings shift between requests, so pages can repeat titles
    busy: false,
    done: false,
    shown: 0,
});

/**
 * Popular movies/series, or search results for `query`, released `batchSize` titles at a time.
 * TMDB only serves fixed pages of 20, so each call to loadMore fetches as many pages as it needs to fill
 * a batch and keeps any surplus for the next one. Changing `type`, `query`, `genre` or `sort` starts the list over.
 */
export const usePagedContent = ({ type, query = "", genre = "", sort = "", batchSize = 50 }) => {
    const [items, setItems] = useState([]);
    const [status, setStatus] = useState("loading"); // "loading" | "loadingMore" | "idle"
    const [error, setError] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const [resetKey, setResetKey] = useState(0);
    const cursor = useRef(newCursor());
    const generation = useRef(0); // bumps on reset, so responses for an old list are dropped

    const loadMore = useCallback(async () => {
        const c = cursor.current;
        if (c.busy || c.done) return;
        c.busy = true;
        const gen = generation.current;
        const isCurrent = () => gen === generation.current;

        setStatus(c.shown === 0 ? "loading" : "loadingMore");
        setError("");
        try {
            while (c.buffer.length < batchSize && c.nextPage <= c.totalPages) {
                const needed = Math.ceil((batchSize - c.buffer.length) / TMDB_PAGE_SIZE);
                const last = Math.min(c.nextPage + needed - 1, c.totalPages);
                const pages = [];
                for (let page = c.nextPage; page <= last; page++) pages.push(page);

                const responses = await Promise.all(pages.map((page) => loadContentPage({ type, query, genre, sort, page })));
                if (!isCurrent()) return;

                c.nextPage = last + 1;
                c.totalPages = Math.min(TMDB_MAX_PAGE, responses[responses.length - 1].totalPages);
                for (const { results } of responses) {
                    for (const item of results) {
                        // Search can find unreleased titles; the browse list leaves them to the Coming soon row
                        // TMDB search ignores genre, so it's checked here too
                        const hidden = (!query && isComingSoon(item)) || !matchesGenre(item, genre);
                        if (isListable(item) && !hidden && !c.seen.has(item.id)) {
                            c.seen.add(item.id);
                            c.buffer.push(item);
                        }
                    }
                }
            }

            const batch = c.buffer.splice(0, batchSize);
            c.shown += batch.length;
            c.done = c.buffer.length === 0 && c.nextPage > c.totalPages;
            setItems((prev) => [...prev, ...batch]);
            setHasMore(!c.done);
        } catch (err) {
            if (isCurrent()) setError(err.message || "Please check your connection and try again.");
        } finally {
            if (isCurrent()) {
                c.busy = false;
                setStatus("idle");
            }
        }
    }, [type, query, genre, sort, batchSize]);

    // New type or query (or a reload): throw the old list away and load the first batch
    useEffect(() => {
        generation.current += 1;
        cursor.current = newCursor();
        setItems([]);
        setHasMore(true);
        setError("");
        loadMore();
    }, [loadMore, resetKey]);

    /** Start the list over from the first batch. */
    const reload = useCallback(() => setResetKey((key) => key + 1), []);

    return {
        items,
        loading: status === "loading",
        loadingMore: status === "loadingMore",
        error,
        hasMore,
        loadMore,
        reload,
    };
};
