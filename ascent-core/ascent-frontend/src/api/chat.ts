import api from './axios'
import type { ApiResponse, ChatRoom, ChatMessage, ChatRoomMember, PageResponse } from '../types'

// 채팅방 단건 조회
export const getChatRoom = async (projectId: number) => {
  const response = await api.get<ApiResponse<ChatRoom>>(`/projects/${projectId}/chat/room`)
  return response.data
}

// 내가 속한 채팅방 목록
export const getMyChatRooms = async () => {
  const response = await api.get<ApiResponse<ChatRoom[]>>('/chat/rooms/me')
  return response.data
}

// 채팅방 멤버 목록
export const getChatRoomMembers = async (projectId: number) => {
  const response = await api.get<ApiResponse<ChatRoomMember[]>>(`/projects/${projectId}/chat/room/members`)
  return response.data
}

// 메시지 목록 조회
export const getMessages = async (projectId: number, page = 0, size = 20, cursorId?: number) => {
  const response = await api.get<ApiResponse<PageResponse<ChatMessage>>>(
    `/projects/${projectId}/chat/messages`,
    { params: { page, size, cursorId } }
  )
  return response.data
}

// 메시지 전송 
export const sendMessage = async (projectId: number, content: string) => {
  const response = await api.post<ApiResponse<ChatMessage>>(
    `/projects/${projectId}/chat/messages`,
    { content }
  )
  return response.data
}