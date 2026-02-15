import axiosInstance from "../api/Axios";

export const isAuthenticated = () => {
  return !!localStorage.getItem("access");
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  localStorage.removeItem("has_donor");
};

export const logout = clearSession;

export const logoutUser = async () => {
  const refresh = localStorage.getItem("refresh");

  try {
    if (refresh) {
      await axiosInstance.post("auth/logout/", { refresh });
    }
  } catch {
    // Ignore API logout failure and always clear local session.
  } finally {
    clearSession();
  }
};
