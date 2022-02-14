import service from '@/api/service'

// 获取标签列表
function getTags() {
  return service.get('/tag/list')
}

// 获取文章列表
function getArticles(options) {
  return service.get('/article/list', {
    params: options
  })
}

// 获取文章详情
function getArticleDetail(id) {
  return service.get('/article/detail/' + id)
}

// 删除文章
function delArticle(id) {
  return service.post('/article/delete/' + id)
}

export { getTags, getArticles, getArticleDetail, delArticle }
