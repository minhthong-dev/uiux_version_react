import BASE_API_URL from "../config/configApiUrl";
const CHAT_API_URL = `${BASE_API_URL}/historychat`;
import { manageToken, getInfor } from "../utils/manageToken";
const getHistoryChat = async (userId) => {
    const response = await fetch(`${CHAT_API_URL}/${userId}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    return await response.json();

};
const getHistoryChatListAdmin = async () => {
    const response = await fetch(`${CHAT_API_URL}/`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    return await response.json();
}
export {
     getHistoryChat,
     getHistoryChatListAdmin
};