export const parseList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.results)) {
    return payload.results;
  }
  return [];
};

export const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};

export const getLocalUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user || null;
  } catch {
    return null;
  }
};

export const isAdminUser = () => {
  return getLocalUser()?.role === "admin";
};
