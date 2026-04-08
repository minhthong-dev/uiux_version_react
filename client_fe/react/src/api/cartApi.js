import BASE_API_URL from "../config/configApiUrl";
const CART_API_URL = `${BASE_API_URL}/cart`;
import { manageToken, getInfor } from "../utils/manageToken";

const getCart = async () => {
    const response = await fetch(`${CART_API_URL}/${getInfor().id}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    console.log("hello", data);
    return data || [];
};
const addToCart = async (gameId) => {
    const response = await fetch(`${CART_API_URL}/add`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId: gameId, userId: getInfor().id }),
    });
    const text = await response.text();
    let data = {};
    if (text) {
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: text };
        }
    }
    return { status: response.status, ...data };
};
const removeFromCart = async (gameId) => {
    const response = await fetch(`${CART_API_URL}/${getInfor().id}/${gameId}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const text = await response.text();
    let data = {};
    if (text) {
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: text };
        }
    }
    return { status: response.status, ...data };
};
const inCart = async (userId, gameId) => {
    const response = await fetch(`${CART_API_URL}/gameincart/${userId}/${gameId}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    console.log(data);
    return data;
}
export default {
    getCart,
    addToCart,
    removeFromCart,
    inCart,
};