// 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}

// 유저
export interface User {
  id: number
  email: string
  nickname: string
}

// 프로젝트
export interface Project {
  id: number
  title: string
  description: string
  status: 'OPEN' | 'CLOSED' | 'ARCHIVED'
  ownerId: number
}

// 채팅방
export interface ChatRoom {
  id: number
  projectId: number
  projectTitle: string
  createdAt: string
}

// 채팅 메시지
export interface ChatMessage {
  id: number
  roomId: number
  senderId: number
  senderEmail: string
  content: string
  createdAt: string
}

// 채팅방 멤버
export interface ChatRoomMember {
  userId: number
  email: string
  nickname: string
  role: 'OWNER' | 'MEMBER'
  joinedAt: string
}

// 초대 코드
export interface InviteCode {
  code: string
  projectId: number
  expiresAt: string
}

// 페이지 응답
export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}