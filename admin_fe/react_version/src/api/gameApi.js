import BASE_API_URL from "../config/configApiUrl";
const GAME_API_URL = `${BASE_API_URL}/games`;
import { manageToken } from "../utils/manageToken";
const getAllGames = async () => {
    const response = await fetch(`${GAME_API_URL}/all`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    console.log(data);
    return data.data || [];
};

export default {
    getAllGames,
};