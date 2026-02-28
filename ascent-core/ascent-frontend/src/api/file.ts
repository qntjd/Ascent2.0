import api from './axios'
import type { ApiResponse } from '../types'

export interface ProjectFile {
  id: number
  originalName: string
  url: string
  fileType: string
  fileSize: number
  uploaderId: number
  uploaderNickname: string
  createdAt: string
}

export const getFiles = async (projectId: number) => {
  return api.get<ApiResponse<ProjectFile[]>>(`/projects/${projectId}/files`)
}

export const uploadFile = async (projectId: number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<ApiResponse<ProjectFile>>(`/projects/${projectId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteFile = async (projectId: number, fileId: number) => {
  return api.delete(`/projects/${projectId}/files/${fileId}`)
}