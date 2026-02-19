import BASE_API_URL from "../config/configApiUrl";
const USER_API_URL = `${BASE_API_URL}/users`;
import { manageToken } from "../utils/manageToken";

const getAllUsers = async () => {
    const response = await fetch(`${USER_API_URL}/all`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data.data || data || [];
};

const toggleBlockUser = async (userId, isBlocked) => {
    // Giả sử API update status người dùng
    const response = await fetch(`${USER_API_URL}/toggle-block/${userId}`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ isBlocked })
    });
    return await response.json();
};

export default {
    getAllUsers,
    toggleBlockUser
};
