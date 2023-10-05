import request from '@/utils/request'

interface UploadData {
  multipart: FormData
}

export const fileApi = {
  /**
   * 上传任何类型文件
   * @param data formData
   * @param params 
   * @returns 
   */
  uploadFile(data: UploadData, params = {}) {
    return request.post('/api/admin/upload2MinIO/file', data, { params }).then(res => Promise.resolve(res.data))
  },
  /**
   * 图片上传
   * @param data formData
   * @param params
   * @returns
   */
  uploadImg(data: UploadData, params = {}) {
    return request.post('/api/admin/upload2MinIO/image', data, { params }).then(res => Promise.resolve(res.data))
  },
  /**
   * pdf上传
   * @param data formData
   * @param params
   * @returns
   */
  uploadPdf(data: UploadData, params = {}) {
    return request.post('/api/admin/upload2MinIO/pdf', data, { params }).then(res => Promise.resolve(res.data))
  },
  /**
   * 视频上传
   * @param data formData
   * @param params
   * @returns
   */
  uploadVideo(data: UploadData, params = {}) {
    return request.post('/api/admin/upload2MinIO/video', data, { params }).then(res => Promise.resolve(res.data))
  },
  delFile(url: string) {
    const data = { url }
    return request.post('/api/admin/upload2MinIO/delete', data).then(res => Promise.resolve(res.data))
  }
}