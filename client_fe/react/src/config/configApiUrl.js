const getBaseApiUrl = () => {
  const isLocal = 
    window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1";

  return isLocal 
    ? "http://localhost:3000/api" 
    : "https://node-version-webbangame.onrender.com/api";
};

const BASE_API_URL = getBaseApiUrl();

console.log("BASE_API_URL:", BASE_API_URL);
export default BASE_API_URL;