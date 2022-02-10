function getToken() {
  return localStorage.getItem("token") || "";
}
function getTitle() {
  return "Vite App";
}

export { getToken, getTitle };
