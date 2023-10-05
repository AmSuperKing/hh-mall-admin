import request from '@/utils/request'

interface ProductQuery {
  cid?: string
  prodId?: string | number
  flag?: boolean
  prodCode?: string
  prodName?: string
  page?: number
  limit?: number
  sort?: number
}

export const productApi = {
  getProductList(params: ProductQuery) {
    return request.get('/api/admin/heheProduct/list', { params }).then(res => Promise.resolve(res.data))
  },
  addProduct(data: ProductProps) {
    return request.post('/api/admin/heheProduct/save', data).then(res => Promise.resolve(res.data))
  },
  updateProduct(data: ProductProps) {
    return request.put('/api/admin/heheProduct/update', data).then(res => Promise.resolve(res.data))
  },
  delProduct(prodId: string) {
    return request.delete(`/api/admin/heheProduct/delete/${prodId}`).then(res => Promise.resolve(res.data))
  },
  getProductDetail(prodId: string) {
    return request.get(`/api/admin/heheProductDetail/info/${prodId}`).then(res => Promise.resolve(res.data))
  },
  addProductDetail(data: ProductDetail) {
    return request.post('/api/admin/heheProductDetail/save', data).then(res => Promise.resolve(res.data))
  },
  updateProductDetail(data: ProductDetail) {
    return request.put('/api/admin/heheProductDetail/update', data).then(res => Promise.resolve(res.data))
  },
  delProductDetail(prodId: string) {
    return request.delete(`/api/admin/heheProductDetail/delete/${prodId}`).then(res => Promise.resolve(res.data))
  }
}
