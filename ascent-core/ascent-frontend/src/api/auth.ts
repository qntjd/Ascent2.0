import api from './axios'
import type { ApiResponse, User } from '../types'

// 회원가입
export const signup = async (email: string, password: string, nickname: string) => {
  const response = await api.post<ApiResponse<User>>('/users/signup', {
    email,
    password,
    nickname,
  })
  return response.data
}

// 로그인
export const login = async (email: string, password: string) => {
  const response = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
    '/auth/login',
    { email, password }
  )
  return response.data
}