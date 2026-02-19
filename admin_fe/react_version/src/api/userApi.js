import BASE_API_URL from "../config/configApiUrl";
const USER__API_URL = `${BASE_API_URL}/users`;
import { manageToken } from "../utils/manageToken";

const getAllUsers = async () => {
    const response = await fetch(`${USER__API_URL}/all`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data.data || [];
};
