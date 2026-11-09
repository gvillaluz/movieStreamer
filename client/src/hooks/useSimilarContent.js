import { useCallback, useEffect, useState } from "react";
import { getSimilarContent } from "../services/serviceAPI";

/**
 * Loads recommendations for a title.
 * Returns { items, loading, error, retry } where items are de-duplicated,
 * exclude the title itself, and always have a poster and a name.
 */
const useSimilarContent = (category, id) => {
    const [state, setState] = useState({ items: [], loading: true, error: false });

    const load = useCallback(async () => {
        setState({ items: [], loading: true, error: false });
        try {
            const data = (await getSimilarContent(category, id)) ?? [];
            const unique = Array.from(new Map(data.map((con) => [con.id, con])).values());
            const items = unique.filter((con) =>
                con.id !== Number(id) &&
                con.poster_path &&
                (con.title || con.name)
            );
            setState({ items, loading: false, error: false });
        } catch {
            setState({ items: [], loading: false, error: true });
        }
    }, [category, id]);

    useEffect(() => { load(); }, [load]);

    return { ...state, retry: load };
};

export default useSimilarContent;
