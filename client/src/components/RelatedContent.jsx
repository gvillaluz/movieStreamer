import { getSimilarContent } from "../services/serviceAPI";
import MovieCard from "./MovieCard";
import { useState, useEffect } from 'react'

const RelatedContent = ({relatedContent, category, id}) => {
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState([]);

    useEffect(() => {
        const genres = relatedContent.map(content => content.id).join(",");
        const getRelatedContent = async () => {
            const data = await getSimilarContent(category, genres);
            setContent(data);
            setLoading(false);
        }
        console.log(genres)

        getRelatedContent();
    }, [relatedContent]); 
    
    const uniqueContents = Array.from(
        new Map(content.map((con) => [con.id, con])).values()
    );

    const newContent = uniqueContents.filter(con => con.id !== id);

    console.log(content);

    return (
        (!loading ? (
            (newContent.length !== 0 &&
                <>
                    <h3>More Like This</h3>
                    <div className="related-list">
                        {newContent.map((content, index) => (
                            content.poster_path && <MovieCard key={content.id + '-' + index} content={content} type={category} />
                        ))}
                    </div> 
                </>
            )
        ) : (
            <div className="loading">
                <div className="loader"></div>
                <h3>Loading {category}.....</h3>
            </div>

        ))
    )
}

export default RelatedContent;