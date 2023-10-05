import request from '@/utils/request'

interface CategoryQuery {
  cid?: string
  name?: string
  parentId?: string | number,
  flag?: number
  status?: number
  page?: number
  limit?: number
  ids?: number | string
}

export const categoryApi = {
  getCategoryList(params: CategoryQuery) {
    return request.get('/api/admin/heheCategory/list', { params }).then(res => Promise.resolve(res.data))
  },
  /**
   * 获取tree结构的列表
   * @param {string} name 分类名称
   * @param {number} status 状态：-1全部，1正常，0失效
   * @returns 
   */
  getCategoryListTree(name: string = '', status: number = -1) {
    return request.get(`/api/admin/heheCategory/list/tree?name=${name}&status=${status}`).then(res => Promise.resolve(res.data))
  },
  getSubCategoryList(params: CategoryQuery) {
    return request.get('/api/admin/heheCategory/list/subCategory', { params }).then(res => Promise.resolve(res.data))
  },
  getCategoryListByParent(params: CategoryQuery) {
    return request.get('/api/admin/heheCategory/list/parentIds', { params }).then(res => Promise.resolve(res.data))
  },
  getCategoryInfo(cid: string) {
    return request.get(`/api/admin/heheCategory/info?id=${cid}`).then(res => Promise.resolve(res.data))
  },
  addCategory(data: CategoryProps) {
    return request.post('/api/admin/heheCategory/save', data).then(res => Promise.resolve(res.data))
  },
  updateCategory(data: CategoryProps) {
    const params = { cid: data.cid }
    return request.put('/api/admin/heheCategory/update', data, { params }).then(res => Promise.resolve(res.data))
  },
  delCategory(cid: string) {
    return request.delete(`/api/admin/heheCategory/delete/${cid}`).then(res => Promise.resolve(res.data))
  }
}
