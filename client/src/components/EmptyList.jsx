import './EmptyList.css'

const EmptyList = ({ page, message }) => {
    return (
        <div className="NoContent">
                <h2>No {page} Available</h2>
                <p>{message}</p>
        </div>
    )
}

export default EmptyList;