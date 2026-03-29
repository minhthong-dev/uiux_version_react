import axios from "axios";
import { toast } from "../components/notification/toast";

const axiosClient = axios.create({
    baseURL: "https://node-version-webbangame.onrender.com/api",
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status === 401 || error.response.status === 403) {
            console.log("token het han");
            localStorage.removeItem("token");
            toast.error("Hết phiên đăng nhập, vui lòng đăng nhập lại!");
            window.dispatchEvent(new Event("token-expired"));
        }
        return Promise.reject(error);
    }
);
export default axiosClient;