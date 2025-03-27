const Details = ({content}) =>  {
    const imageUrl = `https://image.tmdb.org/t/p/w200${content.poster_path}`;
    return (
        <>
        <div className="description-section">
                <img src={imageUrl} alt="Content" />
                <div className="text-container">
                    <h2 className="title">{content.title ? content.title : content.name}</h2>
                    {content.tagline && <p><strong>Tag Line:  </strong>{content.tagline}</p>}
                    <p><strong>{content.release_date ? "Release Date: " : "First Air Date: "}</strong>{content.release_date ? content.release_date : content.first_air_date}</p>
                    {!content.seasons ? (
                        <p><strong>Run Time: </strong> {content.runtime} minutes</p>
                    ) : (
                        <p>
                            <strong>Seasons: </strong> {content.seasons.length} <br></br>
                            <strong>Episodes: </strong>{content.number_of_episodes}
                        </p>
                    )}
                    <p><strong>Genres: </strong> {content.genres?.map(gen => gen.name).join(", ")}</p>
                    <p><strong>Language: </strong> {content.spoken_languages?.map(lang => lang.english_name).join(", ")}</p>
                    <p className="overview"><strong>Overview: </strong> </p>
                    <p className="overview-text">{content.overview}</p>
                    <p> ⭐ {content.vote_average} ({content.vote_count} votes)</p>
                </div>
            </div>
        </>
    )
}

export default Details;