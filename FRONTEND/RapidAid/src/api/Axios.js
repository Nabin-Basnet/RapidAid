import axios from "axios";

const BASE_URL = "http://localhost:8000/api"; // Django backend

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to every request if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access"); // make sure your token is stored under "access"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
