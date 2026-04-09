import BASE_API_URL from "../config/configApiUrl";
import { manageToken } from "../utils/manageToken";

const INVENTORY_API_URL = `${BASE_API_URL}/inventory`;

const getAllStock = async () => {
    const response = await fetch(`${INVENTORY_API_URL}/all`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;  // { total, data: [...] }
};

const getStockByGameId = async (gameId) => {
    const response = await fetch(`${INVENTORY_API_URL}/${gameId}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;
};

const addStock = async ({ gameId, quantity, mode = "increment" }) => {
    const response = await fetch(`${INVENTORY_API_URL}/add-stock`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId, quantity, mode }),
    });
    const data = await response.json();
    return data;
};

export default { getAllStock, getStockByGameId, addStock };
