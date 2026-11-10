import { useLocation, useNavigate } from "react-router-dom";

const MAX_STACK = 30;

/**
 * In-app navigation that remembers where the viewer came from.
 *
 * navigate(-1) steps through the browser's history, which is not the same thing as "the page I came
 * from": the embedded video player adds its own history entries, "Back to details" pushes a new one,
 * and a page opened directly has no previous entry at all. Instead every navigation made with `go`
 * carries the trail of pages in location.state, and `goBack` returns to the last one on that trail.
 */
export const useAppNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const here = location.pathname + location.search;
    const stack = Array.isArray(location.state?.backStack) ? location.state.backStack : [];

    /** Go to a page, remembering this one so Back can return here. */
    const go = (to) => {
        navigate(to, { state: { backStack: [...stack, here].slice(-MAX_STACK) } });
    };

    /** Return to the previous page in the trail, or to `fallback` when the page was opened directly. */
    const goBack = (fallback = "/") => {
        if (stack.length) {
            navigate(stack[stack.length - 1], { state: { backStack: stack.slice(0, -1) } });
        } else {
            navigate(fallback, { replace: true });
        }
    };

    return { go, goBack, backStack: stack, canGoBack: stack.length > 0 };
};
