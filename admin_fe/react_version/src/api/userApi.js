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
    return await response.json();
};

const toggleBlockUser = async (userId, isBlocked) => {
    const response = await fetch(`${USER_API_URL}/block/${userId}`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    return await response.json();
};

const toggleUnBlockUser = async (userId, isBlocked) => {
    const response = await fetch(`${USER_API_URL}/unblock/${userId}`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    return await response.json();
};
export default {
    getAllUsers,
    toggleBlockUser,
    toggleUnBlockUser
};
