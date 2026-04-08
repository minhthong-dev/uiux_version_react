import axios from 'axios';
import API_URL from '../config/configApiUrl';
import { manageToken } from '../utils/manageToken';

const getHeaders = () => ({
    'Authorization': `Bearer ${manageToken.getToken()}`,
    'Content-Type': 'application/json'
});

const walletApi = {
    // Categories (Regions)
    getAllWalletCategories: async () => {
        try {
            const response = await axios.get(`${API_URL}/wallets/categories`, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            return { error: error.response?.data?.error || error.message };
        }
    },
    createWalletCategory: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/wallets/categories`, data, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            return { error: error.response?.data?.error || error.message };
        }
    },
    updateCategory: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/wallets/categories/${id}`, data, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            return { error: error.response?.data?.error || error.message };
        }
    },
    deleteCategory: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/wallets/categories/${id}`, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            return { error: error.response?.data?.error || error.message };
        }
    },

    // Wallets
    getAllWallets: async () => {
        try {
            const response = await axios.get(`${API_URL}/wallets`, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            return { error: error.response?.data?.error || error.message };
        }
    },
    createWallet: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/wallets`, data, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            return { error: error.response?.data?.error || error.message };
        }
    },
    updateWallet: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/wallets/${id}`, data, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            return { error: error.response?.data?.error || error.message };
        }
    },
    deleteWallet: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/wallets/${id}`, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            return { error: error.response?.data?.error || error.message };
        }
    }
};

export default walletApi;
