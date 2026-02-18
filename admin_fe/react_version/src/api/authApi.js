import BASE_API_URL from "../config/configApiUrl";

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

export default {
    login,
};
