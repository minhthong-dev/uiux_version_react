import { useContext } from "react";
import { DiscountContext } from "../context/discountContext";

const useGameDiscount = () => {
    const { discountMap } = useContext(DiscountContext);

    const calculateDiscount = (game) => {
        if (!game || typeof game.price !== 'number') return { finalDiscount: 0, discountedPrice: 0 };

        const gamePercent = discountMap?.games?.[game._id] || 0;
        const categoryPercent = (game.genre || []).reduce((maxPercent, catId) => {
            return Math.max(maxPercent, discountMap?.categories?.[catId] || 0);
        }, 0);

        const finalDiscount = Math.max(gamePercent, categoryPercent);
        const discountedPrice = finalDiscount > 0 ? game.price * (1 - finalDiscount / 100) : game.price;

        return { finalDiscount, discountedPrice };
    };

    return { discountMap, calculateDiscount };
};

export default useGameDiscount;
