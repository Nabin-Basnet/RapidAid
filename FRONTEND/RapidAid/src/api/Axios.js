import axios from "axios";

const BASE_URL = "http://localhost:8000/api"; // Replace with your Django backend URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;