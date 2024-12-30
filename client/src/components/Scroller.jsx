import React, { useEffect } from "react";

const Scroller = ({ items, speed = "default", direction = "left" }) => {
    useEffect(() => {
        // Check for reduced motion preference
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        // Add animation logic
        const scrollers = document.querySelectorAll(".scroller");

        scrollers.forEach((scroller) => {
            if (scroller.getAttribute("data-animated") === "true") {
                return;
            }

            scroller.setAttribute("data-animated", true);

            const scrollerInner = scroller.querySelector(".scroller__inner");
            const scrollerContent = Array.from(...scrollerInner.children);

            // Clone each item for seamless animation
            scrollerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true);
                duplicatedItem.setAttribute("aria-hidden", true);
                scrollerInner.appendChild(duplicatedItem);
            });
        });
    }, []);

    return (
        <div
            className={`scroller`}
            data-speed={speed}
            data-direction={direction}
        >
            <ul className="tag-list scroller__inner">
                {items.map((item, index) => (
                    <li key={index} className="scroller-list-item">
                        <img src={item.logo} alt={item.pair} />
                        <div className="price-text">
                            <p className="pair">
                                {item.pair.split("-")[0]}/
                                {item.pair.split("-")[1]}
                            </p>
                            <p className="price">{item.price}</p>
                            <p
                                className={`change ${
                                    item.change24h < 0 ? "down" : "up"
                                }`}
                            >
                                {item.change24h}%
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Scroller;
