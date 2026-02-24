import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:3636",
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
            alert("het phien dang nhap");
            window.dispatchEvent(new Event("token-expired"));
        }
        return Promise.reject(error);
    }
);
export default axiosClient;