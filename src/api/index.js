import service from "@/api/service";

// 获取标签列表
function getTags() {
  return service.get("/tag/list");
}

// 获取文章列表
function getArticles(options) {
  return service.get("/article/list", {
    params: options,
  });
}

// 获取文章详情
function getArticleDetail(id) {
  return service.get("/article/detail/" + id);
}

// 删除文章
function delArticle(id) {
  return service.post("/article/delete/" + id);
}

// 获取角色列表
function getRoleList() {
  return service.get("/roles");
}

// 删除角色
function deleteRole(roleId) {
  return service.post("/role/delete", {
    roleId,
  });
}

// 添加角色
function createRole(options) {
  return service.post("/role", options);
}

// 权限列表
function getPermissions() {
  return service.get("/permission");
}

// 获取用户拥有的权限
function getRolePermiss(roleId) {
  return service.post("/role-permiss", {
    roleId,
  });
}

// 调整角色的权限
function modifyRolePermission(options) {
  return service.post("/role/permission", options);
}

export {
  getTags,
  getArticles,
  getArticleDetail,
  delArticle,
  getRoleList,
  deleteRole,
  createRole,
  getPermissions,
  getRolePermiss,
  modifyRolePermission,
};
