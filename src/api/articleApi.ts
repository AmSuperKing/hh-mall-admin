import request from '@/utils/request'

export const articleApi = {
  getArticleList(params: ArticleProps) {
    return request.get('/api/admin/heheArticle/list', { params }).then(res => Promise.resolve(res.data))
  },
  getArticleDetail(articleId: string | number) {
    return request.get(`/api/admin/heheArticle/getInfo/${articleId}`).then(res => Promise.resolve(res.data))
  },
  addArticle(data: ArticleProps) {
    return request.post('/api/admin/heheArticle/save', data).then(res => Promise.resolve(res.data))
  },
  updateArticle(data: ArticleProps) {
    return request.put('/api/admin/heheArticle/update', data).then(res => Promise.resolve(res.data))
  },
  delArticle(articleId: string | number) {
    return request.delete(`/api/admin/heheArticle/delete/${articleId}`).then(res => Promise.resolve(res.data))
  }
}