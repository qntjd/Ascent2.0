import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 갱신 중 중복 요청 방지
let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token!)
  })
  failedQueue = []
}

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401이고 아직 재시도 안 한 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken')

      // 리프레시 토큰 없으면 바로 로그아웃
      if (!refreshToken) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      // 이미 갱신 중이면 큐에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          { refreshToken }
        )

        const newAccessToken = res.data.data.accessToken
        localStorage.setItem('accessToken', newAccessToken)

        processQueue(null, newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)

      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api