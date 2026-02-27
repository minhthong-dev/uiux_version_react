import BASE_API_URL from "../config/configApiUrl";
import { manageToken, getInfor } from "../utils/manageToken";
const HISTORY_API_URL = `${BASE_API_URL}/history`;

const getHistory = async () => {
    const response = await fetch(`${HISTORY_API_URL}/${getInfor().id}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    return response.json();
}
export default {
    getHistory
}