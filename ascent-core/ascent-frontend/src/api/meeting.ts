import api from './axios'
import type { ApiResponse } from '../types'

export interface MeetingAttendee {
  userId: number
  nickname: string
}

export interface MeetingActionItem {
  id: number
  title: string
  assigneeId: number | null
  assigneeNickname: string | null
  dueDate: string | null
  linkedToKanban: boolean
}

export interface MeetingDecision {
  id: number
  content: string
}

export interface Meeting {
  id: number
  title: string
  meetingDate: string
  content: string | null
  nextMeetingDate: string | null
  authorId: number
  authorNickname: string
  attendees: MeetingAttendee[]
  actionItems: MeetingActionItem[]
  decisions: MeetingDecision[]
  createdAt: string
}

export interface MeetingSummary {
  id: number
  title: string
  meetingDate: string
  authorNickname: string
  actionItemCount: number
  decisionCount: number
  createdAt: string
}

export const getMeetings = (projectId: number) =>
  api.get<ApiResponse<MeetingSummary[]>>(`/projects/${projectId}/meetings`)

export const getMeeting = (meetingId: number) =>
  api.get<ApiResponse<Meeting>>(`/meetings/${meetingId}`)

export const createMeeting = (projectId: number, data: {
  title: string
  meetingDate: string
  content?: string
  nextMeetingDate?: string
  attendeeIds?: number[]
  actionItems?: { title: string; assigneeId?: number | null; dueDate?: string }[]
  decisions?: string[]
}) => api.post<ApiResponse<Meeting>>(`/projects/${projectId}/meetings`, data)

export const linkActionItemToKanban = (projectId: number, meetingId: number, actionItemId: number) =>
  api.post<ApiResponse<Meeting>>(`/projects/${projectId}/meetings/${meetingId}/action-items/${actionItemId}/link-kanban`)

export const deleteMeeting = (projectId: number, meetingId: number) =>
  api.delete(`/projects/${projectId}/meetings/${meetingId}`)