import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PageBackButton = () => {
    const navigate = useNavigate();

    return (
        <button className="page-back-button" type="button" onClick={() => navigate(-1)}>
            <FaArrowLeft aria-hidden="true" />
            <span>Back</span>
        </button>
    );
};

export default PageBackButton;
