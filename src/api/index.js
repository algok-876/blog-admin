import service from '@/api/service'

// 获取标签列表
function getTags(options) {
  return service.get('/tag/list', { params: options })
}

// 创建标签
function createTag(options) {
  return service.post('/tag/create', options)
}

// 删除标签
function deleteTag(id) {
  return service.post(`/tag/delete/${id}`)
}

// 更改标签
function updataTag(id, options) {
  return service.post(`/tag/update/${id}`, options)
}

// 获取文章列表
function getArticles(options) {
  return service.get('/article/list', {
    params: options
  })
}

function createArticle(options) {
  return service.post('/article/create', options)
}

// 获取文章详情
function getArticleDetail(id) {
  return service.get('/article/detail/' + id)
}

// 更新文章数据
function updateArticle(id, options) {
  return service.post(`/article/update/${id}`, options)
}

// 删除文章
function delArticle(id) {
  return service.post('/article/delete/' + id)
}

// 获取角色列表
function getRoleList() {
  return service.get('/roles')
}

// 删除角色
function deleteRole(roleId) {
  return service.post('/role/delete', {
    roleId
  })
}

// 添加角色
function createRole(options) {
  return service.post('/role', options)
}

// 权限列表
function getPermissions() {
  return service.get('/permission')
}

// 获取用户拥有的权限
function getRolePermiss(roleId) {
  return service.post('/role-permiss', {
    roleId
  })
}

// 调整角色的权限
function modifyRolePermission(options) {
  return service.post('/role/permission', options)
}

// 获取文章数据
function articleCount() {
  return service.get('/article/count')
}

/* // 获取近7天的文章数量
function articleCountWeek() {
  return service.get("/article/week")
}

// 获取近30天的文章数量
function articleCountMonth() {
  return service.get("/article/month")
} */

// 文章数量（图表数据）
function articleChartData(presetDate) {
  return service.get('/article/chart', {
    params: {
      preset_date: presetDate
    }
  })
}

// 获取访问人数数据
function visitCount() {
  return service.get('/visit/count')
}

/* // 获取近7天的访问人数数据
function visitCountWeek() {
  return service.get("/visit/week")
}

// 获取近30天的访问人数数据
function visitCountMonth() {
  return service.get("/visit/month")
} */

// 访问人数（图表数据）
function visitChartData(presetDate) {
  return service.get('/visit/chart', {
    params: {
      preset_date: presetDate
    }
  })
}

// 获取后台用户列表
function getAdminList() {
  return service.get('/user/list')
}

// 获取图片
function getRolesList() {
  return service.get('/roles')
}

// 添加用户
function createUser(options) {
  return service.post('/user/create', options)
}

// 删除用户
function deleteUser(id) {
  return service.post(`/user/delete/${id}`)
}

// 调整用户角色
function modifyUserRole(options) {
  return service.post("/user/role", options)
}

export {
  getTags,
  deleteTag,
  createTag,
  updataTag,
  getArticles,
  getArticleDetail,
  delArticle,
  getRoleList,
  deleteRole,
  createRole,
  getPermissions,
  getRolePermiss,
  modifyRolePermission,
  updateArticle,
  createArticle,
  articleCount,
  visitCount,
  visitChartData,
  articleChartData,
  getAdminList,
  getRolesList,
  createUser,
  deleteUser,
  modifyUserRole
}
