import BASE_API_URL from "../config/configApiUrl";
const CATEGORY_API_URL = `${BASE_API_URL}/categories`;
import { manageToken } from "../utils/manageToken";

const getAllCategories = async () => {
    const response = await fetch(`${CATEGORY_API_URL}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;
};

const createCategory = async (category) => {
    const response = await fetch(`${CATEGORY_API_URL}/create`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
    });
    const data = await response.json();
    return data;
};
const deleteCategory = async (categoryId) => {
    const response = await fetch(`${CATEGORY_API_URL}/${categoryId}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;
};

const updateCategory = async (categoryId, categoryData) => {
    const response = await fetch(`${CATEGORY_API_URL}/${categoryId}`, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
    });
    const data = await response.json();
    return data;
};

export default {
    getAllCategories,
    createCategory,
    deleteCategory,
    updateCategory
};