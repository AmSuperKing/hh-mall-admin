import request from '@/utils/request'

interface VideoQuery {
  cid?: string | number
  categoryName?: string
  videoId?: string | number
  headline?: number
  page?: number
  limit?: number
  flag?: boolean
  createTime?: string
  updateTime?: string
}

export const videoApi = {
  getVideoList(params: VideoQuery) {
    return request.get('/api/admin/heheVideo/list', { params }).then(res => Promise.resolve(res.data))
  },
  addVideo(data: VideoProps) {
    return request.post('/api/admin/heheVideo/save', data).then(res => Promise.resolve(res.data))
  },
  updateVideo(data: VideoProps) {
    return request.put('/api/admin/heheVideo/update', data).then(res => Promise.resolve(res.data))
  },
  delVideo(videoId: string | number) {
    return request.delete(`/api/admin/heheVideo/delete?videoId=${videoId}`).then(res => Promise.resolve(res.data))
  }
}
