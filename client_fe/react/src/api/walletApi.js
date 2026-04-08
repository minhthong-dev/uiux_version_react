import axiosClient from "./axiosClient";

const walletApi = {
    getAllWallets: async () => {
        try {
            const response = await axiosClient.get('/wallets');
            return response.data;
        } catch (error) {
            console.error("Error in getAllWallets:", error);
            return [];
        }
    },
    getWalletById: async (id) => {
        try {
            const response = await axiosClient.get(`/wallets/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error in getWalletById:", error);
            return null;
        }
    }
};

export default walletApi;
