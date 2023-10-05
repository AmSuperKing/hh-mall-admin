import request from '@/utils/request'

export const appletApi = {
  getSettingList(params: AppletInfo | PageData) {
    return request.get('/api/admin/heheEnterpriseData/list', { params }).then(res => Promise.resolve(res.data))
  },
  addSetting(data: AppletInfo) {
    return request.post('/api/admin/heheEnterpriseData/save', data).then(res => Promise.resolve(res.data))
  },
  updateSetting(data: AlbumProps) {
    return request.post('/api/admin/heheEnterpriseData/update', data).then(res => Promise.resolve(res.data))
  },
  delSetting(dataId: string | number) {
    return request.delete(`/api/admin/heheEnterpriseData/delete/${dataId}`).then(res => Promise.resolve(res.data))
  }
}