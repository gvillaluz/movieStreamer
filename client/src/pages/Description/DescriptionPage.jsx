import { useCallback, useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { searchById } from "../../services/serviceAPI";
import { useLocation, useParams } from "react-router-dom";
import { useAppNavigation } from "../../hooks/useAppNavigation";
import Details from './components/Details'
import Trailer from "./components/Trailer";
import './DescriptionPage.css'
import RelatedContent from "./components/RelatedContent";
import PageBackButton from "../../components/PageBackButton";
import EmptyState from "../../components/EmptyState";
import { DetailSkeleton } from "../../components/Skeletons";

const DescriptionPage = () => {
    const location = useLocation();
    const { go } = useAppNavigation();
    const { id } = useParams();
    const [content, setContent] = useState(null);
    const [error, setError] = useState("");
    const [category, setCateogry] = useState("");

    const load = useCallback(async () => {
        const nextCategory = location.pathname.includes("movie") ? "movie" :
            location.pathname.includes("series") ? "tv" : "";

        setCateogry(nextCategory);
        setError("");
        setContent(null);

        try {
            const data = await searchById(id, nextCategory);
            if (!data?.data) throw new Error("We couldn't find that title.");
            setContent(data);
        } catch (err) {
            setError(err.message || "Unable to load title details right now.");
        }
    }, [id, location.pathname]);

    useEffect(() => { load(); }, [load]);

    const handleWatchNow = () => {
        go(`/watch/${category}/${content.data.id}`);
    }

    // Opened directly (no trail to return along): Back goes to the list this title belongs to
    const listPage = location.pathname.includes("series") ? "/series" : "/movie";

    if (error) {
        return (
            <main className="page-content">
                <PageBackButton fallback={listPage} />
                <EmptyState
                    tone="error"
                    icon={<FaExclamationTriangle />}
                    title="Couldn't load this title"
                    message={error}
                    action={{ label: "Try again", onClick: load }}
                />
            </main>
        );
    }

    if (!content) {
        return <DetailSkeleton label="Loading title details..." />;
    }

    return (
        <main className="description-page page-content">
            <PageBackButton fallback={listPage} />
            <div className="description">
                <Details content={content.data} category={category} handleWatchNow={handleWatchNow} />
                {content.trailer && <Trailer video={content.trailer.key} />}
                <div className="description-section related">
                    <RelatedContent relatedContent={content.data.genres} category={category} id={content.data.id} />
                </div>
            </div>
        </main>
    );
}

export default DescriptionPage;
