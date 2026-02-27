import BASE_API_URL from "../config/configApiUrl";
import { manageToken, getInfor } from "../utils/manageToken";
const AUTH_API_URL = `${BASE_API_URL}/users`;

const login = async (email, password) => {
    const response = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ loginKey: email, password: password }),
    });
    return response.json();
};
const resgister = async (username, email, password) => {
    const response = await fetch(`${AUTH_API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, username: username, password: password }),
    });
    return response.json();
};
const forgotPassword = async (email) => {
    const response = await fetch(`${AUTH_API_URL}/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
    });
    return response.json();
};
const updateMoney = async (amount) => {
    const description = getInfor().id;
    const response = await fetch(`${AUTH_API_URL}/payment-link`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + manageToken.getToken(),
        },
        body: JSON.stringify({ amount: amount, description: description }),
    });
    return response.json();
}
const getAmoutById = async (id) => {
    const response = await fetch(`${AUTH_API_URL}/amount/${id}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    return response.json();
}
export default {
    login,
    resgister,
    forgotPassword,
    updateMoney,
    getAmoutById
};
