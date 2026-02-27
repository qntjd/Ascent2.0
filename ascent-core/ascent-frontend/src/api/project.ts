import api from './axios'
import type { ApiResponse, Project, InviteCode, PageResponse, ProjectMember } from '../types'

export const createProject = async (title: string, description: string) => {
  return api.post<ApiResponse<Project>>('/projects', { title, description })
}

export const getProjects = async () => {
  return api.get<ApiResponse<PageResponse<Project>>>('/projects')
}

export const getProject = async (projectId: number) => {
  return api.get<ApiResponse<Project>>(`/projects/${projectId}`)
}

export const createInviteCode = async (projectId: number) => {
  return api.post<ApiResponse<InviteCode>>(`/projects/${projectId}/invite-code`)
}

export const joinProject = async (code: string) => {
  return api.post<ApiResponse<Project>>(`/projects/join?code=${code}`)
}

export const getProjectMembers = async (projectId: number) => {
  return api.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`)
}

export const updateRoleDescription = async (projectId: number, targetUserId: number, roleDescription: string) => {
  return api.patch<ApiResponse<ProjectMember>>(`/projects/${projectId}/members/${targetUserId}/role`, { roleDescription })
}