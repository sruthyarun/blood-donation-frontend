import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.DEV
        ? "http://localhost:5000/api"
        : "https://blood-donation-backend-olwl.onrender.com/api",

    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;