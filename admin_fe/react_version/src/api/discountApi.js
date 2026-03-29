import BASE_URL_API from "../config/configApiUrl";
const DISCOUT_URL_API = `${BASE_URL_API}/discount`;
import { manageToken } from "../utils/manageToken";
const token = manageToken.getToken();
export const getDiscounts = async () => {
    try {
        const response = await fetch(`${DISCOUT_URL_API}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    } catch (error) {
        console.error('Error fetching discounts:', error);
        throw error;
    }
}
export const createDiscount = async (discount) => {
    try {
        const response = await fetch(`${DISCOUT_URL_API}`, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + manageToken.getToken(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(discount),
        });
        return response.json();
    } catch (error) {
        console.error('Error creating discount:', error);
        throw error;
    }
}
export const getDiscountsById = async (id) => {
    try {
        const response = await fetch(`${DISCOUT_URL_API}/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    } catch (error) {
        console.error('Error fetching discount:', error);
        throw error;
    }
}
export const updateDiscount = async (id, discount) => {
    try {
        const response = await fetch(`${DISCOUT_URL_API}/${id}`, {
            method: 'PUT',
            headers: {
                "Authorization": "Bearer " + manageToken.getToken(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(discount),
        });
        return response.json();
    } catch (error) {
        console.error('Error updating discount:', error);
        throw error;
    }
}
export const deleteDiscount = async (id) => {
    try {
        const response = await fetch(`${DISCOUT_URL_API}/${id}`, {
            method: 'DELETE',
            headers: {
                "Authorization": "Bearer " + manageToken.getToken(),
                "Content-Type": "application/json",
            },
        });
        return response.json();
    } catch (error) {
        console.error('Error deleting discount:', error);
        throw error;
    }
}
