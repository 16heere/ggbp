import React from "react";

const ScrollerCard = ({ item, index }) => {
    return (
        <div key={index} className="ticker-card">
            <img
                src={item.logo}
                alt={item.pair}
                className="ticker-card__logo"
            />
            <p className="ticker-card__pair">
                {item.pair.split("-")[0]}/{item.pair.split("-")[1]}
            </p>
            <p className="ticker-card__price">{item.price}</p>
            <p
                className={`ticker-card__change ${
                    item.change24h < 0
                        ? "ticker-card__change--down"
                        : "ticker-card__change--up"
                }`}
            >
                {item.change24h}%
            </p>
        </div>
    );
};

export default ScrollerCard;
