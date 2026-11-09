import '../components/WatchPageRelated.css'
import RelatedList from "../../../components/RelatedList";

const WatchPageRelated = ({ category, id }) => (
    <RelatedList category={category} id={id} listClassName="watch-related-list" />
);

export default WatchPageRelated;
