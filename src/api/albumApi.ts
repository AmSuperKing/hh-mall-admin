import request from '@/utils/request'

interface AlbumQuery {
  albumId?: string | number
  albumName?: string
  page?: number
  limit?: number
}

export const albumApi = {
  getAlbumList(params: AlbumQuery) {
    return request.get('/api/admin/heheAlbum/list', { params }).then(res => Promise.resolve(res.data))
  },
  addAlbum(data: AlbumProps) {
    return request.post('/api/admin/heheAlbum/save', data).then(res => Promise.resolve(res.data))
  },
  updateAlbum(data: AlbumProps) {
    const params = { albumId: data.albumId }
    return request.put('/api/admin/heheAlbum/update', data, { params }).then(res => Promise.resolve(res.data))
  },
  delAlbum(albumId: string | number) {
    return request.delete(`/api/admin/heheAlbum/delete?albumId=${albumId}`).then(res => Promise.resolve(res.data))
  }
}