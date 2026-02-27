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

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const clearSession = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  localStorage.removeItem("has_donor");
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Skip refresh loop on login/register/logout/reset endpoints.
    const url = String(originalRequest.url || "");
    if (
      url.includes("auth/login/") ||
      url.includes("auth/register/") ||
      url.includes("auth/logout/") ||
      url.includes("auth/password-reset/")
    ) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
      const newAccess = res.data?.access;
      const newRefresh = res.data?.refresh || refresh;
      if (!newAccess) {
        throw new Error("No access token returned");
      }

      localStorage.setItem("access", newAccess);
      localStorage.setItem("refresh", newRefresh);
      onRefreshed(newAccess);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
