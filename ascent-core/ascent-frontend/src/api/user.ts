import api from './axios'
import type { ApiResponse, User } from '../types'

// 내 정보 조회
export const getMe = async () => {
  const response = await api.get<ApiResponse<User>>('/users/me')
  return response.data
}

// 닉네임 수정
export const updateNickname = async (nickname: string) => {
  const response = await api.patch<ApiResponse<User>>('/users/me/nickname', { nickname })
  return response.data
}