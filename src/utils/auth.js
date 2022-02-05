function getToken() {
  return localStorage.getItem("token") || "";
}

export { getToken };
