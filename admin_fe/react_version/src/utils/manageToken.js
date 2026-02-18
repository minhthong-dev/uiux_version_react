const TOKEN_KEY = "token";
import { jwtDecode } from "jwt-decode";
export const manageToken = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
    removeToken: () => localStorage.removeItem(TOKEN_KEY),
}
export const getInfor = (token) => {
    if (token) {
        return jwtDecode(token);

    }
    return null;
}

