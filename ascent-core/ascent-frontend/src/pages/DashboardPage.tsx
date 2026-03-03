import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMessages } from '../api/chat'
import { getProjectMembers, addMemberTag, deleteMemberTag, getProject } from '../api/project'
import { getMe } from '../api/user'
import { getSchedules } from '../api/schedule'
import { getFiles } from '../api/file'
import { getCards } from '../api/kanban'
import { getMeetings } from '../api/meeting'
import type { Schedule } from '../api/schedule'
import type { ProjectFile } from '../api/file'
import type { KanbanCard } from '../api/kanban'
import type { MeetingSummary } from '../api/meeting'
import type { ChatMessage, ProjectMember, Project } from '../types'
import ChatTab from '../components/dashboard/ChatTab'
import KanbanTab from '../components/dashboard/KanbanTab'
import ScheduleTab from '../components/dashboard/ScheduleTab'
import FilesTab from '../components/dashboard/FilesTab'
import MeetingsTab from '../components/dashboard/MeetingsTab'
import { avatarColor, TAG_COLORS } from '../components/dashboard/shared'

type Tab = 'dashboard' | 'chat' | 'kanban' | 'schedule' | 'files' | 'meetings'

const TAB_CONFIG: { key: Tab; label: string; icon: string }[] = [
  { key: 'dashboard', label: '대시보드', icon: '⊞' },
  { key: 'chat',      label: '채팅',     icon: '💬' },
  { key: 'kanban',    label: '할일',     icon: '🗂️' },
  { key: 'schedule',  label: '일정',     icon: '📅' },
  { key: 'meetings',  label: '회의록',   icon: '📝' },
  { key: 'files',     label: '파일',     icon: '📎' },
]

export default function DashboardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const pid = Number(projectId)

  // 공통 상태
  const [tab, setTab] = useState<Tab>('dashboard')
  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [myUserId, setMyUserId] = useState<number | null>(null)
  const [myRole, setMyRole] = useState<'OWNER' | 'MEMBER' | null>(null)

  // 탭별 데이터
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [cards, setCards] = useState<KanbanCard[]>([])
  const [meetings, setMeetings] = useState<MeetingSummary[]>([])

  // 대시보드 탭 태그 상태
  const [addingTagUserId, setAddingTagUserId] = useState<number | null>(null)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [projectRes, memberRes, meRes, msgRes, scheduleRes, fileRes, cardRes, meetingRes] = await Promise.all([
          getProject(pid), getProjectMembers(pid), getMe(),
          getMessages(pid), getSchedules(pid), getFiles(pid),
          getCards(pid), getMeetings(pid),
        ])
        setProject(projectRes.data.data)
        setMembers(memberRes.data.data)
        setMyUserId(meRes.data.id)
        setMessages(msgRes.data.content.reverse())
        setSchedules(scheduleRes.data.data)
        setFiles(fileRes.data.data)
        setCards(cardRes.data.data)
        setMeetings(meetingRes.data.data)
        const me = memberRes.data.data.find((m: ProjectMember) => m.userId === meRes.data.id)
        if (me) setMyRole(me.role)
      } catch (err) { console.error(err) }
    }
    fetchAll()
  }, [pid])

  const handleAddTag = async (targetUserId: number) => {
    if (!tagInput.trim()) return
    try {
      const res = await addMemberTag(pid, targetUserId, tagInput.trim())
      setMembers((prev) => prev.map((m) => m.userId === targetUserId ? { ...m, tags: res.data.data.tags } : m))
      setTagInput(''); setAddingTagUserId(null)
    } catch { alert('태그 추가 실패 (최대 5개)') }
  }

  const handleDeleteTag = async (targetUserId: number, tagId: number) => {
    try {
      const res = await deleteMemberTag(pid, targetUserId, tagId)
      setMembers((prev) => prev.map((m) => m.userId === targetUserId ? { ...m, tags: res.data.data.tags } : m))
    } catch { alert('태그 삭제 실패') }
  }

  const completedCount = schedules.filter((s) => s.completed).length

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#111827', fontFamily: "'DM Sans', sans-serif", color: '#e8e8f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      {/* 헤더 */}
      <div style={{ background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '52px' }}>
          <button onClick={() => navigate('/projects')}
            style={{ padding: '5px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#9090a8', cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e8e8f0' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9090a8' }}>
            ← 프로젝트
          </button>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #6c63ff, #63b3ff)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>⚡</div>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{project?.title || '...'}</span>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          {TAB_CONFIG.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '10px 18px', fontSize: '13px', fontWeight: 500, background: 'transparent', border: 'none',
              borderBottom: `2px solid ${tab === key ? '#6c63ff' : 'transparent'}`,
              color: tab === key ? '#6c63ff' : '#6b6b80', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.15s',
            }}
            onMouseEnter={e => { if (tab !== key) e.currentTarget.style.color = '#e8e8f0' }}
            onMouseLeave={e => { if (tab !== key) e.currentTarget.style.color = '#6b6b80' }}>
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {/* 대시보드 탭 */}
      {tab === 'dashboard' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '20px' }}>
            {/* 프로젝트 정보 */}
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

            {/* 통계 카드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: '팀원',      value: `${members.length}명`,                      icon: '👥', color: '#6c63ff' },
                { label: '일정 완료', value: `${completedCount}/${schedules.length}`,     icon: '✅', color: '#4ade80' },
                { label: '칸반 카드', value: `${cards.length}개`,                         icon: '🗂️', color: '#a78bfa' },
                { label: '파일',      value: `${files.length}개`,                         icon: '📎', color: '#f59e0b' },
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

            {/* 일정 진행률 */}
            {schedules.length > 0 && (
              <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#d1d5db' }}>일정 진행률</h3>
                  <span style={{ fontSize: '13px', color: '#6c63ff', fontWeight: 600 }}>{completedCount}/{schedules.length}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #6c63ff, #63b3ff)', width: `${(completedCount / schedules.length) * 100}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            )}

            {/* 팀원 */}
            <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#d1d5db' }}>팀원 — {members.length}명</h3>
                {myRole === 'OWNER' && <span style={{ fontSize: '11px', color: '#6c63ff' }}>+ 태그 버튼으로 역할 추가</span>}
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {members.map((member) => (
                  <div key={member.userId} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#111827', borderRadius: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: avatarColor(member.email), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: 'white' }}>
                      {member.email[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{member.nickname}</span>
                        {member.userId === myUserId && <span style={{ fontSize: '10px', color: '#6b6b80' }}>(나)</span>}
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '20px', background: member.role === 'OWNER' ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.06)', color: member.role === 'OWNER' ? '#6c63ff' : '#6b6b80', border: `1px solid ${member.role === 'OWNER' ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                          {member.role}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {member.tags.map((tag, idx) => {
                          const c = TAG_COLORS[idx % TAG_COLORS.length]
                          return (
                            <span key={tag.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                              {tag.tag}
                              {myRole === 'OWNER' && (
                                <button onClick={() => handleDeleteTag(member.userId, tag.id)}
                                  style={{ background: 'transparent', border: 'none', color: c.color, cursor: 'pointer', fontSize: '10px', padding: '0', opacity: 0.6 }}
                                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}>✕</button>
                              )}
                            </span>
                          )
                        })}
                        {myRole === 'OWNER' && member.tags.length < 5 && (
                          addingTagUserId === member.userId ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                                placeholder="태그..." maxLength={30} autoFocus
                                style={{ padding: '2px 8px', fontSize: '11px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: '#e8e8f0', width: '80px', outline: 'none' }}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(member.userId); if (e.key === 'Escape') { setAddingTagUserId(null); setTagInput('') } }} />
                              <button onClick={() => handleAddTag(member.userId)} style={{ padding: '2px 8px', fontSize: '11px', background: '#6c63ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>+</button>
                              <button onClick={() => { setAddingTagUserId(null); setTagInput('') }} style={{ padding: '2px 6px', fontSize: '11px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '20px', color: '#9090a8', cursor: 'pointer' }}>✕</button>
                            </div>
                          ) : (
                            <button onClick={() => { setAddingTagUserId(member.userId); setTagInput('') }}
                              style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)', color: '#6b6b80', cursor: 'pointer' }}>
                              + 태그
                            </button>
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

      {tab === 'chat'     && <ChatTab     projectId={pid} messages={messages} setMessages={setMessages} setFiles={setFiles} />}
      {tab === 'kanban'   && <KanbanTab   projectId={pid} cards={cards} setCards={setCards} setSchedules={setSchedules} members={members} />}
      {tab === 'schedule' && <ScheduleTab projectId={pid} schedules={schedules} setSchedules={setSchedules} members={members} />}
      {tab === 'files'    && <FilesTab    projectId={pid} files={files} setFiles={setFiles} />}
      {tab === 'meetings' && <MeetingsTab projectId={pid} meetings={meetings} setMeetings={setMeetings} setCards={setCards} members={members} />}
    </div>
  )
}