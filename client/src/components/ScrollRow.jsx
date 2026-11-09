import { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./ScrollRow.css";

/** Horizontal, snap-scrolling row with arrow buttons for mouse users (hidden on touch). */
const ScrollRow = ({ label, children }) => {
    const trackRef = useRef(null);
    const [edge, setEdge] = useState({ start: true, end: true });

    const update = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setEdge({
            start: el.scrollLeft <= 4,
            end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
        });
    }, []);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, [update, children]);

    const page = (direction) => {
        const el = trackRef.current;
        el?.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
    };

    return (
        <div className="scroll-row">
            <button
                type="button"
                className="scroll-row-btn prev"
                aria-label={`Scroll ${label} left`}
                disabled={edge.start}
                onClick={() => page(-1)}
            >
                <FaChevronLeft aria-hidden="true" />
            </button>
            <div ref={trackRef} className="movie-list home-grid" onScroll={update}>
                {children}
            </div>
            <button
                type="button"
                className="scroll-row-btn next"
                aria-label={`Scroll ${label} right`}
                disabled={edge.end}
                onClick={() => page(1)}
            >
                <FaChevronRight aria-hidden="true" />
            </button>
        </div>
    );
};

export default ScrollRow;
