function getToken() {
  return localStorage.getItem("token") || "";
}

function getTitle() {
  return "Vite App";
}

// 判断用户是否有权访问路由
function hasRole(userRoles, roles) {
  return userRoles.some((role) => {
    return roles.includes(role.code);
  });
}

export { getToken, getTitle, hasRole };
