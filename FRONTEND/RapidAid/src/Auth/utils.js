export const isAuthenticated = () => {
  return !!localStorage.getItem("access");
};

export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
};
