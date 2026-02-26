import api from './axios'
import type { ApiResponse, Project, InviteCode, PageResponse } from '../types'

// 프로젝트 생성
export const createProject = async (title: string, description: string) => {
  const response = await api.post<ApiResponse<Project>>('/projects', { title, description })
  return response.data
}

// 프로젝트 목록 조회
export const getProjects = async (page = 0, size = 10) => {
  const response = await api.get<ApiResponse<PageResponse<Project>>>('/projects', {
    params: { page, size }
  })
  return response.data
}

// 프로젝트 단건 조회
export const getProject = async (projectId: number) => {
  const response = await api.get<ApiResponse<Project>>(`/projects/${projectId}`)
  return response.data
}

// 초대 코드 생성
export const createInviteCode = async (projectId: number) => {
  const response = await api.post<ApiResponse<InviteCode>>(`/projects/${projectId}/invite-code`)
  return response.data
}

// 초대 코드로 참여
export const joinProject = async (code: string) => {
  const response = await api.post<ApiResponse<Project>>(`/projects/join`, null, {
    params: { code }
  })
  return response.data
}