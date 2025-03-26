const Trailer = ({video}) => {
    return (
        <div className="description-section trailer">
            {video == null ? (
                <h2 className="noVid">No Video Available.</h2>
            ) : (
                <iframe
                    width="80%"
                    height="400"
                    src={`https://www.youtube.com/embed/${video.key}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            )}
        </div>
    )
}

export default Trailer;