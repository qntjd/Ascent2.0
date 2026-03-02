import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getMessages } from '../api/chat'
import { getProjectMembers, addMemberTag, deleteMemberTag, getProject } from '../api/project'
import { getMe } from '../api/user'
import { getSchedules, createSchedule, toggleSchedule, deleteSchedule } from '../api/schedule'
import { getFiles, uploadFile, deleteFile } from '../api/file'
import { getCards, createCard, moveCard, deleteCard } from '../api/kanban'
import type { Schedule } from '../api/schedule'
import type { ProjectFile } from '../api/file'
import type { KanbanCard } from '../api/kanban'
import type { ChatMessage, ProjectMember, Project } from '../types'
import useAuthStore from '../store/authStore'

type Tab = 'dashboard' | 'chat' | 'kanban' | 'schedule' | 'files'

const COLUMNS: { key: 'TODO' | 'IN_PROGRESS' | 'DONE'; label: string; color: string; bg: string }[] = [
  { key: 'TODO',        label: '할 일',    color: '#9090a8', bg: 'rgba(144,144,168,0.08)' },
  { key: 'IN_PROGRESS', label: '진행 중',  color: '#fbbf24', bg: 'rgba(251,191,36,0.08)'  },
  { key: 'DONE',        label: '완료',     color: '#4ade80', bg: 'rgba(74,222,128,0.08)'  },
]

const PRIORITY_MAP = {
  HIGH:   { label: '높음', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  MEDIUM: { label: '중간', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  LOW:    { label: '낮음', color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  },
}

export default function DashboardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { accessToken } = useAuthStore()

  const [tab, setTab] = useState<Tab>('dashboard')
  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [myUserId, setMyUserId] = useState<number | null>(null)
  const [myRole, setMyRole] = useState<'OWNER' | 'MEMBER' | null>(null)

  // 채팅
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dashFileInputRef = useRef<HTMLInputElement>(null)

  // 일정
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({ title: '', description: '', startDate: '', endDate: '', assigneeId: null as number | null })
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  // 파일
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [uploading, setUploading] = useState(false)

  // 칸반
  const [cards, setCards] = useState<KanbanCard[]>([])
  const [showCardForm, setShowCardForm] = useState<'TODO' | 'IN_PROGRESS' | 'DONE' | null>(null)
  const [cardForm, setCardForm] = useState({ title: '', description: '', priority: 'MEDIUM' as 'LOW'|'MEDIUM'|'HIGH', dueDate: '', assigneeId: null as number | null })
  const [dragCardId, setDragCardId] = useState<number | null>(null)

  // 태그
  const [addingTagUserId, setAddingTagUserId] = useState<number | null>(null)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [projectRes, memberRes, meRes, msgRes, scheduleRes, fileRes, cardRes] = await Promise.all([
          getProject(Number(projectId)),
          getProjectMembers(Number(projectId)),
          getMe(),
          getMessages(Number(projectId)),
          getSchedules(Number(projectId)),
          getFiles(Number(projectId)),
          getCards(Number(projectId)),
        ])
        setProject(projectRes.data.data)
        setMembers(memberRes.data.data)
        setMyUserId(meRes.data.id)
        setMessages(msgRes.data.content.reverse())
        setSchedules(scheduleRes.data.data)
        setFiles(fileRes.data.data)
        setCards(cardRes.data.data)
        const me = memberRes.data.data.find((m: ProjectMember) => m.userId === meRes.data.id)
        if (me) setMyRole(me.role)
      } catch (err) { console.error(err) }
    }
    fetchAll()
  }, [projectId])

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || ''
    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsUrl}/ws`),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      onConnect: () => {
        setConnected(true)
        client.subscribe(`/topic/chat/${projectId}`, (message) => {
          const newMsg: ChatMessage = JSON.parse(message.body)
          setMessages((prev) => [...prev, newMsg])
        })
      },
      onDisconnect: () => setConnected(false),
    })
    client.activate()
    clientRef.current = client
    return () => { client.deactivate() }
  }, [projectId, accessToken])

  useEffect(() => {
    if (tab === 'chat') bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, tab])

  const handleSend = () => {
    if (!input.trim() || !clientRef.current?.connected) return
    clientRef.current.publish({ destination: `/app/chat/${projectId}`, body: JSON.stringify({ content: input }) })
    setInput('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadFile(Number(projectId), file)
      setFiles((prev) => [res.data.data, ...prev])
    } catch { alert('파일 업로드 실패') }
    finally { setUploading(false); if (e.target) e.target.value = '' }
  }

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('파일을 삭제할까요?')) return
    try {
      await deleteFile(Number(projectId), fileId)
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch { alert('삭제 실패') }
  }

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await createSchedule(Number(projectId), { ...scheduleForm, assigneeId: scheduleForm.assigneeId || null })
      setSchedules((prev) => [...prev, res.data.data])
      setShowScheduleForm(false)
      setScheduleForm({ title: '', description: '', startDate: '', endDate: '', assigneeId: null })
    } catch { alert('일정 생성 실패') }
  }

  const handleToggle = async (scheduleId: number) => {
    try {
      const res = await toggleSchedule(Number(projectId), scheduleId)
      setSchedules((prev) => prev.map((s) => s.id === scheduleId ? res.data.data : s))
    } catch { alert('상태 변경 실패') }
  }

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('일정을 삭제할까요?')) return
    try {
      await deleteSchedule(Number(projectId), scheduleId)
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
    } catch { alert('삭제 실패') }
  }

  const handleAddTag = async (targetUserId: number) => {
    if (!tagInput.trim()) return
    try {
      const res = await addMemberTag(Number(projectId), targetUserId, tagInput.trim())
      setMembers((prev) => prev.map((m) => m.userId === targetUserId ? { ...m, tags: res.data.data.tags } : m))
      setTagInput(''); setAddingTagUserId(null)
    } catch { alert('태그 추가 실패 (최대 5개)') }
  }

  const handleDeleteTag = async (targetUserId: number, tagId: number) => {
    try {
      const res = await deleteMemberTag(Number(projectId), targetUserId, tagId)
      setMembers((prev) => prev.map((m) => m.userId === targetUserId ? { ...m, tags: res.data.data.tags } : m))
    } catch { alert('태그 삭제 실패') }
  }

  // 칸반
  const handleCreateCard = async (status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (!cardForm.title.trim()) return
    try {
      const res = await createCard(Number(projectId), {
        title: cardForm.title,
        description: cardForm.description || undefined,
        priority: cardForm.priority,
        dueDate: cardForm.dueDate || undefined,
        assigneeId: cardForm.assigneeId || null,
      })
      setCards((prev) => [...prev, res.data.data])
      setShowCardForm(null)
      setCardForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: null })
    } catch { alert('카드 생성 실패') }
  }

  const handleMoveCard = async (cardId: number, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      const res = await moveCard(Number(projectId), cardId, { status: newStatus, position: 999 })
      setCards((prev) => prev.map((c) => c.id === cardId ? res.data.data : c))
    } catch { alert('이동 실패') }
  }

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm('카드를 삭제할까요?')) return
    try {
      await deleteCard(Number(projectId), cardId)
      setCards((prev) => prev.filter((c) => c.id !== cardId))
    } catch { alert('삭제 실패') }
  }

  const handleDragStart = (cardId: number) => setDragCardId(cardId)
  const handleDrop = (status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (dragCardId == null) return
    handleMoveCard(dragCardId, status)
    setDragCardId(null)
  }

  const getColumnCards = (status: 'TODO' | 'IN_PROGRESS' | 'DONE') =>
    cards.filter((c) => c.status === status).sort((a, b) => a.position - b.position)

  // 유틸
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊'
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️'
    return '📁'
  }
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear(); const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth, year, month }
  }
  const getSchedulesForDay = (day: number) => {
    const { year, month } = getDaysInMonth(calendarMonth)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return schedules.filter((s) => s.startDate <= dateStr && s.endDate >= dateStr)
  }
  const avatarColor = (email: string) => {
    const colors = ['#6c63ff', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899']
    let hash = 0
    for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }
  const tagColors = [
    { bg: 'rgba(108,99,255,0.15)', color: '#a78bfa', border: 'rgba(108,99,255,0.3)' },
    { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
    { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    { bg: 'rgba(236,72,153,0.15)', color: '#f472b6', border: 'rgba(236,72,153,0.3)' },
  ]
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  const isSameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString()

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(calendarMonth)
  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  const dayNames = ['일','월','화','수','목','금','토']
  const completedCount = schedules.filter((s) => s.completed).length
  const totalCount = schedules.length

  const tabConfig: { key: Tab; label: string; icon: string }[] = [
    { key: 'dashboard', label: '대시보드', icon: '⊞' },
    { key: 'chat',      label: '채팅',     icon: '💬' },
    { key: 'kanban',    label: '칸반',     icon: '🗂️' },
    { key: 'schedule',  label: '일정',     icon: '📅' },
    { key: 'files',     label: `파일 ${files.length > 0 ? `(${files.length})` : ''}`, icon: '📎' },
  ]

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#111827', fontFamily: "'DM Sans', sans-serif", color: '#e8e8f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .tab-btn { transition: all 0.15s; border-bottom: 2px solid transparent; }
        .tab-btn:hover { color: #e8e8f0 !important; }
        .send-btn:hover:not(:disabled) { background: #7c74ff !important; transform: translateY(-1px); }
        .send-btn { transition: all 0.15s ease; }
        .back-btn:hover { background: rgba(255,255,255,0.06) !important; color: #e8e8f0 !important; }
        .back-btn { transition: all 0.15s; }
        .schedule-row:hover { background: rgba(255,255,255,0.03) !important; }
        .schedule-row { transition: background 0.15s; }
        .file-row:hover { background: rgba(255,255,255,0.04) !important; }
        .file-row { transition: background 0.15s; }
        .cal-day:hover { background: rgba(255,255,255,0.05) !important; }
        .cal-day { transition: background 0.15s; }
        .tag-delete:hover { opacity: 1 !important; }
        .modal-overlay { animation: fadeIn 0.2s ease; }
        .modal-content { animation: fadeUp 0.25s ease; }
        .kanban-card { animation: fadeUp 0.2s ease; cursor: grab; transition: box-shadow 0.15s, transform 0.15s; }
        .kanban-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important; transform: translateY(-2px); }
        .kanban-card:active { cursor: grabbing; }
        .drop-zone { transition: background 0.15s, border-color 0.15s; }
        .drop-zone.drag-over { background: rgba(108,99,255,0.08) !important; border-color: rgba(108,99,255,0.3) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .input-field:focus { border-color: #6c63ff !important; outline: none; }
        textarea:focus { border-color: #6c63ff !important; outline: none; }
        select:focus { border-color: #6c63ff !important; outline: none; }
        .attach-btn:hover { color: #6c63ff !important; }
        .attach-btn { transition: color 0.15s; }
      `}</style>

      {/* 헤더 */}
      <div style={{ background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '52px' }}>
          <button onClick={() => navigate('/projects')} className="back-btn" style={{ padding: '5px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#9090a8', cursor: 'pointer', fontSize: '13px' }}>← 프로젝트</button>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #6c63ff, #63b3ff)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>⚡</div>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{project?.title || '...'}</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b6b80' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: connected ? '#4ade80' : '#f87171', boxShadow: connected ? '0 0 6px #4ade80' : 'none' }} />
            {connected ? '연결됨' : '연결 중...'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0' }}>
          {tabConfig.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key)} className="tab-btn" style={{
              padding: '10px 18px', fontSize: '13px', fontWeight: 500,
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${tab === key ? '#6c63ff' : 'transparent'}`,
              color: tab === key ? '#6c63ff' : '#6b6b80', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {/* 대시보드 탭 */}
      {tab === 'dashboard' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '20px' }}>
            <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: '8px' }}>{project?.title}</h2>
                  <p style={{ fontSize: '14px', color: '#9090a8', lineHeight: 1.6 }}>{project?.description}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 500, padding: '4px 10px', borderRadius: '20px', background: project?.status === 'OPEN' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: project?.status === 'OPEN' ? '#4ade80' : '#f87171', border: `1px solid ${project?.status === 'OPEN' ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                  {project?.status === 'OPEN' ? '진행 중' : project?.status}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: '팀원', value: `${members.length}명`, icon: '👥', color: '#6c63ff' },
                { label: '일정 완료', value: `${completedCount}/${totalCount}`, icon: '✅', color: '#4ade80' },
                { label: '칸반 카드', value: `${cards.length}개`, icon: '🗂️', color: '#a78bfa' },
                { label: '파일', value: `${files.length}개`, icon: '📎', color: '#f59e0b' },
              ].map((card) => (
                <div key={card.label} style={{ background: '#1f2937', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '22px' }}>{card.icon}</div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: card.color }}>{card.value}</div>
                    <div style={{ fontSize: '11px', color: '#6b6b80' }}>{card.label}</div>
                  </div>
                </div>
              ))}
            </div>
            {totalCount > 0 && (
              <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#d1d5db' }}>일정 진행률</h3>
                  <span style={{ fontSize: '13px', color: '#6c63ff', fontWeight: 600 }}>{completedCount}/{totalCount}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #6c63ff, #63b3ff)', width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            )}
            <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#d1d5db' }}>팀원 — {members.length}명</h3>
                {myRole === 'OWNER' && <span style={{ fontSize: '11px', color: '#6c63ff' }}>+ 태그 버튼으로 역할 추가</span>}
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {members.map((member) => (
                  <div key={member.userId} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#111827', borderRadius: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: avatarColor(member.email), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: 'white' }}>{member.email[0].toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{member.nickname}</span>
                        {member.userId === myUserId && <span style={{ fontSize: '10px', color: '#6b6b80' }}>(나)</span>}
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '20px', background: member.role === 'OWNER' ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.06)', color: member.role === 'OWNER' ? '#6c63ff' : '#6b6b80', border: `1px solid ${member.role === 'OWNER' ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.06)'}` }}>{member.role}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {member.tags.map((tag, idx) => {
                          const c = tagColors[idx % tagColors.length]
                          return (
                            <span key={tag.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                              {tag.tag}
                              {myRole === 'OWNER' && <button onClick={() => handleDeleteTag(member.userId, tag.id)} className="tag-delete" style={{ background: 'transparent', border: 'none', color: c.color, cursor: 'pointer', fontSize: '10px', padding: '0', opacity: 0.6 }}>✕</button>}
                            </span>
                          )
                        })}
                        {myRole === 'OWNER' && member.tags.length < 5 && (
                          addingTagUserId === member.userId ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="태그..." maxLength={30} autoFocus className="input-field"
                                style={{ padding: '2px 8px', fontSize: '11px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: '#e8e8f0', width: '80px' }}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(member.userId); if (e.key === 'Escape') { setAddingTagUserId(null); setTagInput('') } }} />
                              <button onClick={() => handleAddTag(member.userId)} style={{ padding: '2px 8px', fontSize: '11px', background: '#6c63ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>+</button>
                              <button onClick={() => { setAddingTagUserId(null); setTagInput('') }} style={{ padding: '2px 6px', fontSize: '11px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '20px', color: '#9090a8', cursor: 'pointer' }}>✕</button>
                            </div>
                          ) : (
                            <button onClick={() => { setAddingTagUserId(member.userId); setTagInput('') }} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)', color: '#6b6b80', cursor: 'pointer' }}>+ 태그</button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 채팅 탭 */}
      {tab === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{ fontSize: '48px' }}>💬</div>
                <p style={{ color: '#6b6b80', fontSize: '14px' }}>첫 메시지를 보내보세요!</p>
              </div>
            ) : messages.map((msg, i) => {
              const showDate = i === 0 || !isSameDay(messages[i - 1].createdAt, msg.createdAt)
              const showAvatar = i === 0 || messages[i - 1].senderEmail !== msg.senderEmail || showDate
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                      <span style={{ fontSize: '11px', color: '#6b6b80', padding: '3px 10px', background: '#1f2937', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>{formatDate(msg.createdAt)}</span>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: showAvatar ? '12px' : '2px' }}>
                    <div style={{ width: '32px', flexShrink: 0 }}>
                      {showAvatar && <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: avatarColor(msg.senderEmail), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'white' }}>{msg.senderEmail[0].toUpperCase()}</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {showAvatar && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: avatarColor(msg.senderEmail) }}>{msg.senderEmail.split('@')[0]}</span>
                          <span style={{ fontSize: '11px', color: '#6b6b80' }}>{formatTime(msg.createdAt)}</span>
                        </div>
                      )}
                      <div style={{ display: 'inline-block', background: '#1f2937', border: '1px solid rgba(255,255,255,0.06)', borderRadius: showAvatar ? '4px 12px 12px 12px' : '12px', padding: '8px 14px', fontSize: '14px', lineHeight: '1.5', color: '#d1d5db', maxWidth: '520px', wordBreak: 'break-word' }}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '6px 6px 6px 12px' }}>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="attach-btn" style={{ background: 'transparent', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: '18px', padding: '4px', display: 'flex', alignItems: 'center' }}>{uploading ? '⏳' : '📎'}</button>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder={connected ? "메시지를 입력하세요..." : "연결 중..."}
                disabled={!connected}
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#e8e8f0', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
              <button onClick={handleSend} disabled={!connected || !input.trim()} className="send-btn" style={{ width: '36px', height: '36px', background: input.trim() && connected ? 'linear-gradient(135deg, #6c63ff, #5a54e8)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', cursor: input.trim() && connected ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 칸반 탭 */}
      {tab === 'kanban' && (
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', height: '100%', minWidth: '720px' }}>
            {COLUMNS.map((col) => {
              const colCards = getColumnCards(col.key)
              return (
                <div key={col.key}
                  className="drop-zone"
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over') }}
                  onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                  onDrop={(e) => { e.currentTarget.classList.remove('drag-over'); handleDrop(col.key) }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', background: col.bg, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}
                >
                  {/* 컬럼 헤더 */}
                  <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: col.color }}>{col.label}</span>
                        <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', color: '#6b6b80' }}>{colCards.length}</span>
                      </div>
                      <button onClick={() => { setShowCardForm(col.key); setCardForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: null }) }}
                        style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', color: '#9090a8', cursor: 'pointer', fontSize: '16px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                    </div>
                  </div>

                  {/* 카드 목록 */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {colCards.map((card) => {
                      const p = PRIORITY_MAP[card.priority]
                      const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && card.status !== 'DONE'
                      return (
                        <div key={card.id} className="kanban-card"
                          draggable
                          onDragStart={() => handleDragStart(card.id)}
                          style={{ background: '#1f2937', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#e8e8f0', lineHeight: 1.4, flex: 1 }}>{card.title}</span>
                            <button onClick={() => handleDeleteCard(card.id)} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '12px', padding: '0', flexShrink: 0, opacity: 0.6 }}>✕</button>
                          </div>
                          {card.description && <p style={{ fontSize: '12px', color: '#9090a8', marginBottom: '8px', lineHeight: 1.4 }}>{card.description}</p>}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: p.bg, color: p.color, fontWeight: 500 }}>{p.label}</span>
                            {card.assigneeNickname && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: 'rgba(108,99,255,0.1)', color: '#a78bfa' }}>👤 {card.assigneeNickname}</span>}
                            {card.dueDate && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: isOverdue ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.06)', color: isOverdue ? '#f87171' : '#6b6b80' }}>📅 {card.dueDate}</span>}
                          </div>
                          {/* 이동 버튼 */}
                          <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                            {COLUMNS.filter((c) => c.key !== col.key).map((target) => (
                              <button key={target.key} onClick={() => handleMoveCard(card.id, target.key)}
                                style={{ flex: 1, padding: '4px', fontSize: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: target.color, cursor: 'pointer', fontWeight: 500 }}>
                                → {target.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    {/* 카드 추가 폼 */}
                    {showCardForm === col.key && (
                      <div style={{ background: '#1f2937', borderRadius: '10px', padding: '12px', border: '1px solid rgba(108,99,255,0.3)' }}>
                        <input type="text" value={cardForm.title} onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                          placeholder="카드 제목..." maxLength={100} autoFocus className="input-field"
                          style={{ width: '100%', padding: '7px 10px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: '#e8e8f0', fontSize: '13px', marginBottom: '8px' }}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleCreateCard(col.key); if (e.key === 'Escape') setShowCardForm(null) }} />
                        <textarea value={cardForm.description} onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                          placeholder="설명 (선택)" rows={2}
                          style={{ width: '100%', padding: '7px 10px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: '#e8e8f0', fontSize: '12px', resize: 'none', fontFamily: 'inherit', marginBottom: '8px' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                          <select value={cardForm.priority} onChange={(e) => setCardForm({ ...cardForm, priority: e.target.value as 'LOW'|'MEDIUM'|'HIGH' })}
                            style={{ padding: '6px 8px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: '#e8e8f0', fontSize: '12px' }}>
                            <option value="LOW">낮음</option>
                            <option value="MEDIUM">중간</option>
                            <option value="HIGH">높음</option>
                          </select>
                          <select value={cardForm.assigneeId || ''} onChange={(e) => setCardForm({ ...cardForm, assigneeId: e.target.value ? Number(e.target.value) : null })}
                            style={{ padding: '6px 8px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: cardForm.assigneeId ? '#e8e8f0' : '#6b6b80', fontSize: '12px' }}>
                            <option value="">담당자</option>
                            {members.map((m) => <option key={m.userId} value={m.userId}>{m.nickname}</option>)}
                          </select>
                        </div>
                        <input type="date" value={cardForm.dueDate} onChange={(e) => setCardForm({ ...cardForm, dueDate: e.target.value })}
                          style={{ width: '100%', padding: '6px 8px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: cardForm.dueDate ? '#e8e8f0' : '#6b6b80', fontSize: '12px', colorScheme: 'dark', marginBottom: '8px' }} />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleCreateCard(col.key)} style={{ flex: 1, padding: '7px', fontSize: '12px', fontWeight: 600, background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', borderRadius: '7px', color: 'white', cursor: 'pointer' }}>추가</button>
                          <button onClick={() => setShowCardForm(null)} style={{ padding: '7px 10px', fontSize: '12px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '7px', color: '#9090a8', cursor: 'pointer' }}>취소</button>
                        </div>
                      </div>
                    )}

                    {colCards.length === 0 && showCardForm !== col.key && (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: '#4b5563', fontSize: '12px' }}>카드가 없어요</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 일정 탭 */}
      {tab === 'schedule' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '20px' }}>
            <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', color: '#e8e8f0', cursor: 'pointer', padding: '6px 10px', fontSize: '14px' }}>‹</button>
                <span style={{ fontSize: '16px', fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>{year}년 {monthNames[month]}</span>
                <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', color: '#e8e8f0', cursor: 'pointer', padding: '6px 10px', fontSize: '14px' }}>›</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                {dayNames.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#6b6b80', fontWeight: 600, padding: '4px 0' }}>{d}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const daySchedules = getSchedulesForDay(day)
                  const today = new Date()
                  const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
                  return (
                    <div key={day} className="cal-day" style={{ minHeight: '64px', padding: '4px', borderRadius: '8px', background: isToday ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.02)', border: isToday ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent' }}>
                      <div style={{ fontSize: '12px', fontWeight: isToday ? 700 : 400, color: isToday ? '#6c63ff' : '#9090a8', marginBottom: '2px' }}>{day}</div>
                      {daySchedules.slice(0, 2).map((s) => (
                        <div key={s.id} style={{ fontSize: '10px', padding: '1px 4px', borderRadius: '4px', marginBottom: '2px', background: s.completed ? 'rgba(74,222,128,0.15)' : 'rgba(108,99,255,0.2)', color: s.completed ? '#4ade80' : '#a78bfa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: s.completed ? 'line-through' : 'none' }}>{s.title}</div>
                      ))}
                      {daySchedules.length > 2 && <div style={{ fontSize: '9px', color: '#6b6b80' }}>+{daySchedules.length - 2}개</div>}
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>일정 목록</h3>
                <button onClick={() => setShowScheduleForm(true)} style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 600, background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,99,255,0.3)' }}>+ 일정 추가</button>
              </div>
              {schedules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b6b80', fontSize: '14px' }}>📅 아직 일정이 없어요!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {schedules.map((s) => (
                    <div key={s.id} className="schedule-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: '#111827' }}>
                      <button onClick={() => handleToggle(s.id)} style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, background: s.completed ? '#4ade80' : 'transparent', border: `2px solid ${s.completed ? '#4ade80' : 'rgba(255,255,255,0.2)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {s.completed && <span style={{ fontSize: '10px', color: '#111827', fontWeight: 700 }}>✓</span>}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: s.completed ? '#6b6b80' : '#e8e8f0', textDecoration: s.completed ? 'line-through' : 'none', marginBottom: '2px' }}>{s.title}</div>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#6b6b80' }}>
                          <span>📅 {s.startDate} ~ {s.endDate}</span>
                          {s.assigneeNickname && <span>👤 {s.assigneeNickname}</span>}
                        </div>
                        {s.description && <div style={{ fontSize: '12px', color: '#9090a8', marginTop: '2px' }}>{s.description}</div>}
                      </div>
                      <button onClick={() => handleDeleteSchedule(s.id)} style={{ background: 'transparent', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: '14px', padding: '4px', opacity: 0.6 }}>🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 파일 탭 */}
      {tab === 'files' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>파일 목록 ({files.length})</h3>
                <div>
                  <input type="file" ref={dashFileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                  <button onClick={() => dashFileInputRef.current?.click()} disabled={uploading} style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 600, background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,99,255,0.3)', opacity: uploading ? 0.6 : 1 }}>
                    {uploading ? '업로드 중...' : '📎 파일 업로드'}
                  </button>
                </div>
              </div>
              {files.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                  <p style={{ color: '#6b6b80', fontSize: '14px' }}>아직 업로드된 파일이 없어요</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {files.map((file) => (
                    <div key={file.id} className="file-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: '#111827' }}>
                      <div style={{ fontSize: '24px', flexShrink: 0 }}>{getFileIcon(file.fileType)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', fontWeight: 500, color: '#e8e8f0', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.originalName}</a>
                        <div style={{ fontSize: '11px', color: '#6b6b80', marginTop: '2px' }}>{formatFileSize(file.fileSize)} · {file.uploaderNickname} · {formatDate(file.createdAt)}</div>
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '6px', color: '#6c63ff', fontSize: '12px', padding: '4px 10px', textDecoration: 'none', flexShrink: 0 }}>다운로드</a>
                      <button onClick={() => handleDeleteFile(file.id)} style={{ background: 'transparent', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: '14px', padding: '4px', opacity: 0.6, flexShrink: 0 }}>🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 일정 추가 모달 */}
      {showScheduleForm && (
        <div className="modal-overlay" onClick={() => setShowScheduleForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '460px', margin: '0 16px' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>일정 추가</h2>
            <form onSubmit={handleCreateSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>제목 *</label>
                <input type="text" value={scheduleForm.title} onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })} placeholder="일정 제목" required maxLength={100} className="input-field" style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>시작일 *</label>
                  <input type="date" value={scheduleForm.startDate} onChange={(e) => setScheduleForm({ ...scheduleForm, startDate: e.target.value })} required className="input-field" style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px', colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>종료일 *</label>
                  <input type="date" value={scheduleForm.endDate} onChange={(e) => setScheduleForm({ ...scheduleForm, endDate: e.target.value })} required className="input-field" style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px', colorScheme: 'dark' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>담당자</label>
                <select value={scheduleForm.assigneeId || ''} onChange={(e) => setScheduleForm({ ...scheduleForm, assigneeId: e.target.value ? Number(e.target.value) : null })} style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: scheduleForm.assigneeId ? '#e8e8f0' : '#6b6b80', fontSize: '14px' }}>
                  <option value="">담당자 없음</option>
                  {members.map((m) => <option key={m.userId} value={m.userId}>{m.nickname}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>설명</label>
                <textarea value={scheduleForm.description} onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })} placeholder="일정 설명 (선택)" maxLength={500} rows={3} style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px', resize: 'none', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowScheduleForm(false)} style={{ padding: '9px 18px', fontSize: '13px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#9090a8', cursor: 'pointer' }}>취소</button>
                <button type="submit" style={{ padding: '9px 20px', fontSize: '13px', fontWeight: 600, background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }}>추가</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}