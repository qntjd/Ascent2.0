import api from './axios'
import type { ApiResponse } from '../types'

export interface KanbanCard {
  id: number
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string | null
  position: number
  assigneeId: number | null
  assigneeNickname: string | null
  createdAt: string
}

export const getCards = (projectId: number) =>
  api.get<ApiResponse<KanbanCard[]>>(`/projects/${projectId}/kanban`)

export const createCard = (projectId: number, data: {
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE'
  title: string
  description?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string
  assigneeId?: number | null
}) => api.post<ApiResponse<KanbanCard>>(`/projects/${projectId}/kanban`, data)

export const updateCard = (projectId: number, cardId: number, data: {
  title?: string
  description?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string
  assigneeId?: number | null
}) => api.patch<ApiResponse<KanbanCard>>(`/projects/${projectId}/kanban/${cardId}`, data)

export const moveCard = (projectId: number, cardId: number, data: {
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  position: number
}) => api.patch<ApiResponse<KanbanCard>>(`/projects/${projectId}/kanban/${cardId}/move`, data)

export const deleteCard = (projectId: number, cardId: number) =>
  api.delete(`/projects/${projectId}/kanban/${cardId}`)