function getToken() {
  return localStorage.getItem("token") || "";
}

function getTitle() {
  return "博客后台管理系统";
}

// 判断用户是否有权访问路由
function hasRole(userRoles, roles) {
  return userRoles.some((role) => {
    return roles.includes(role.code);
  });
}

// 根据是否有token决定是否需要自动登录
function isAutoLogin () {
  return !!getToken()
}

export { getToken, getTitle, hasRole, isAutoLogin };
