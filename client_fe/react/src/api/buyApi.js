import BASE_URL_API from '../config/configApiUrl';
import { manageToken } from "../utils/manageToken";
const BUY_API = `${BASE_URL_API}/buy`;
const createBuyGame = async (userId, amount, gameId) => {
    try {
        const response = await fetch(BUY_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + manageToken.getToken(),
            },
            body: JSON.stringify({ userId: userId, amount: amount, gameId: gameId }),
        });
        return response.json();
    } catch (error) {
        console.error('Error creating buy game:', error);
        throw error;
    }
}
export default createBuyGame;