import RelatedList from "../../../components/RelatedList";

const RelatedContent = ({ category, id }) => (
    <RelatedList category={category} id={id} listClassName="related-list" />
);

export default RelatedContent;
