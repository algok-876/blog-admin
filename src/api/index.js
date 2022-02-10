import service from '@/api/service'

// 获取标签列表
function getTags () {
  return service.get('/tag/list')
}

export {
  getTags
}
