import { useEffect, useState } from "react";
import { getVidById, searchById } from "../services/serviceAPI";
import { useParams } from "react-router-dom";
import Details from '../components/Details'
import Trailer from "../components/Trailer";
import './DescriptionPage.css'

const DescriptionPage = () => {
    const { id } = useParams();
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [video, setVideo] = useState({});
    

    useEffect(() => {
        const getContent = async () => {
            const category = location.pathname.includes("movie") ? "movie" :
                 location.pathname.includes("series") ? "tv" : "";
            const data = await searchById(id, category);
            const video = await getVidById(id, category);
            setContent(data);
            setVideo(video);
            setLoading(false);
        }

        getContent();
    }, [id, location.pathname]);

    console.log(content)

    return (
        (!loading ? (
            <div className="description">
                <Details content={content} />
                <Trailer video={video} />
                <div className="description-section">
                    <h3>More Like This</h3>
                </div>
            </div>
        ) : (
            <div className="loading">
                <div className="loader"></div>
                <h3>Loading.....</h3>
            </div>

        ))
    )
}

export default DescriptionPage;