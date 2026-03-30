import BASE_API_URL from "../config/configApiUrl";
const CHAT_API_URL = `${BASE_API_URL}/historychat`;
import { manageToken, getInfor } from "../utils/manageToken";

const getHistoryChat = async () => {
    const userId = getInfor().id;
    let response;
    try {
        response = await fetch(`${CHAT_API_URL}/${userId}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    } catch (error) {
        response = { success: false, message: "Lỗi kết nối đến server" };
    }
    return await response.json();

};

export { getHistoryChat };