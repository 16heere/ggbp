import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        console.log(`Scrolling to top for route: ${pathname}`);
        window.scrollTo({
            top: 0,
            behavior: "smooth", // Smooth scrolling
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
