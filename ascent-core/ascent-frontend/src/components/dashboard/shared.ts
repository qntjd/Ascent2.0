export const COLUMNS = [
  { key: 'TODO'        as const, label: '할 일',   color: '#9090a8', bg: 'rgba(144,144,168,0.08)' },
  { key: 'IN_PROGRESS' as const, label: '진행 중', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)'  },
  { key: 'DONE'        as const, label: '완료',    color: '#4ade80', bg: 'rgba(74,222,128,0.08)'  },
]

export const PRIORITY_MAP = {
  HIGH:   { label: '높음', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  MEDIUM: { label: '중간', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  LOW:    { label: '낮음', color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  },
}

export const TAG_COLORS = [
  { bg: 'rgba(108,99,255,0.15)', color: '#a78bfa', border: 'rgba(108,99,255,0.3)' },
  { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  { bg: 'rgba(236,72,153,0.15)', color: '#f472b6', border: 'rgba(236,72,153,0.3)' },
]

export const avatarColor = (email: string) => {
  const colors = ['#6c63ff', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899']
  let hash = 0
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

export const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })