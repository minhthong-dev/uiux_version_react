import BASE_API_URL from "../config/configApiUrl";
const DISCOUNT_API_URL = `${BASE_API_URL}/discount`;
import { manageToken, getInfor } from "../utils/manageToken";

const getAllDiscount = () => {
    return fetch(DISCOUNT_API_URL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${manageToken.getToken()}`
        }
    })
};


export default {
    getAllDiscount
}