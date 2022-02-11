import service from '@/api/service'

// 获取标签列表
function getTags () {
  return service.get('/tag/list')
}

// 获取新闻列表
function getArticles() {
  return service.get('/article/list')
}

export {
  getTags,
  getArticles
}
