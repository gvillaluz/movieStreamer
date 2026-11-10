import { FaArrowLeft } from "react-icons/fa";
import { useAppNavigation } from "../hooks/useAppNavigation";

/** Back to the page the viewer came from, or to `fallback` when the page was opened directly. */
const PageBackButton = ({ fallback = "/" }) => {
    const { goBack } = useAppNavigation();

    return (
        <button className="page-back-button" type="button" onClick={() => goBack(fallback)}>
            <FaArrowLeft aria-hidden="true" />
            <span>Back</span>
        </button>
    );
};

export default PageBackButton;
