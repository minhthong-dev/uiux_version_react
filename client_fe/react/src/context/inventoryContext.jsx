import { createContext, useContext, useState, useCallback } from "react";
import BASE_API_URL from "../config/configApiUrl";

export const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {

    const [stockCache, setStockCache] = useState({});

    const checkStock = useCallback(async (gameId) => {
        if (!gameId) return true;

        if (stockCache[gameId] !== undefined) {
            return stockCache[gameId];
        }

        try {
            const res = await fetch(`${BASE_API_URL}/inventory/${gameId}`);
            const data = await res.json();

            if (data?.error) {
                setStockCache(prev => ({ ...prev, [gameId]: true }));
                return true;
            }
            const available = (data.stock ?? 0) - (data.reserved ?? 0);
            const inStock = available > 0;

            setStockCache(prev => ({ ...prev, [gameId]: inStock }));
            return inStock;

        } catch (err) {
            console.error("Lỗi khi kiểm tra tồn kho:", err);
            setStockCache(prev => ({ ...prev, [gameId]: true }));
            return true;
        }
    }, [stockCache]);

    return (
        <InventoryContext.Provider value={{ checkStock }}>
            {children}
        </InventoryContext.Provider>
    );
};
