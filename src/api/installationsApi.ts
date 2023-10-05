import request from '@/utils/request'

export const installationsApi = {
  getInstallActionsList(params: installationsProps) {
    return request.get('/api/admin/installExplain/list', { params }).then(res => Promise.resolve(res.data))
  },
  addInstallActions(data: installationsProps) {
    return request.post('/api/admin/installExplain/save', data).then(res => Promise.resolve(res.data))
  },
  updateInstallActions(data: installationsProps) {
    return request.put('/api/admin/installExplain/update', data).then(res => Promise.resolve(res.data))
  },
  delInstallActions(installExplainId: string | number) {
    return request.delete(`/api/admin/installExplain/delete/${installExplainId}`).then(res => Promise.resolve(res.data))
  }
}
