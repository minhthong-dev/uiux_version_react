import axiosClient from "./axiosClient";
import { manageToken } from "../utils/manageToken";

const walletApi = {
    getAllWallets: async () => {
        try {
            const response = await axiosClient.get('/wallets', {
                headers: {
                    "Authorization": `Bearer ${manageToken.getToken()}`
                }
            });
            console.log(response)
            return response.data;
        } catch (error) {
            console.error("Error in getAllWallets:", error);
            return [];
        }
    },
    getWalletById: async (id) => {
        try {
            const response = await axiosClient.get(`/wallets/${id}`, {
                headers: {
                    "Authorization": `Bearer ${manageToken.getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error in getWalletById:", error);
            return null;
        }
    }
};

export default walletApi;
