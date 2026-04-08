import axios from "axios";
import { toast } from "../components/notification/toast";


const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

const API_URL = isLocalhost
    ? 'http://localhost:3636/api'
    : 'https://node-version-webbangame.onrender.com/api';

const axiosClient = axios.create({
    baseURL: API_URL,
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