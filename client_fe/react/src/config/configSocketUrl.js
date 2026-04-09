const getBaseApiUrl = () => {
    const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

    return isLocal
        ? "http://localhost:3636"
        : "https://node-version-webbangame.onrender.com";
};
const SOCKET_URL = getBaseApiUrl();
console.log("SOCKET_URL:", SOCKET_URL);

export default SOCKET_URL;