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
    //console.log("response:", await response.json());
    return await response.json();
};

const toggleBlockUser = async (userId, socket) => {
    const response = await fetch(`${USER_API_URL}/block/${userId}`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const result = await response.json();
    if (socket) socket.emit('user_block', { userId, isBlocked: true });
    return result;
};

const toggleUnBlockUser = async (userId, socket) => {
    const response = await fetch(`${USER_API_URL}/unblock/${userId}`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const result = await response.json();
    if (socket) socket.emit('user_unblock', { userId, isBlocked: false });
    return result;
};
export default {
    getAllUsers,
    toggleBlockUser,
    toggleUnBlockUser
};
