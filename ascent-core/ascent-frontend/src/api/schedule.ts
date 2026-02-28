import api from './axios'
import type { ApiResponse } from '../types'

export interface Schedule {
  id: number
  projectId: number
  title: string
  description: string | null
  startDate: string
  endDate: string
  completed: boolean
  assigneeId: number | null
  assigneeNickname: string | null
  createdAt: string
}

export const getSchedules = async (projectId: number) => {
  return api.get<ApiResponse<Schedule[]>>(`/projects/${projectId}/schedules`)
}

export const createSchedule = async (projectId: number, data: {
  title: string
  description?: string
  startDate: string
  endDate: string
  assigneeId?: number | null
}) => {
  return api.post<ApiResponse<Schedule>>(`/projects/${projectId}/schedules`, data)
}

export const updateSchedule = async (projectId: number, scheduleId: number, data: {
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  assigneeId?: number | null
}) => {
  return api.patch<ApiResponse<Schedule>>(`/projects/${projectId}/schedules/${scheduleId}`, data)
}

export const toggleSchedule = async (projectId: number, scheduleId: number) => {
  return api.patch<ApiResponse<Schedule>>(`/projects/${projectId}/schedules/${scheduleId}/toggle`)
}

export const deleteSchedule = async (projectId: number, scheduleId: number) => {
  return api.delete(`/projects/${projectId}/schedules/${scheduleId}`)
}