export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};
export const getToken = () => {
  return localStorage.getItem("token");
};
export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};
