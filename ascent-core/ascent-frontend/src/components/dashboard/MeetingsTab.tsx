import { useState } from 'react'
import { getMeeting, createMeeting, linkActionItemToKanban, deleteMeeting } from '../../api/meeting'
import { getCards } from '../../api/kanban'
import type { Meeting, MeetingSummary } from '../../api/meeting'
import type { KanbanCard } from '../../api/kanban'
import type { ProjectMember } from '../../types'

interface Props {
  projectId: number
  meetings: MeetingSummary[]
  setMeetings: React.Dispatch<React.SetStateAction<MeetingSummary[]>>
  setCards: React.Dispatch<React.SetStateAction<KanbanCard[]>>
  members: ProjectMember[]
}

const TEMPLATES = [
  { icon: '🗓️', label: '정기 회의',    content: '## 진행 사항\n\n## 논의 사항\n\n## 다음 회의 안건' },
  { icon: '🚀', label: '스프린트 계획', content: '## 이번 스프린트 목표\n\n## 작업 분배\n\n## 주의 사항' },
  { icon: '🔍', label: '회고 회의',    content: '## 잘된 점 (Keep)\n\n## 개선할 점 (Problem)\n\n## 시도할 것 (Try)' },
]

const emptyForm = () => ({ title: '', meetingDate: '', content: '', nextMeetingDate: '', attendeeIds: [] as number[], actionItems: [] as { title: string; assigneeId: number | null; dueDate: string }[], decisions: [] as string[] })

export default function MeetingsTab({ projectId, meetings, setMeetings, setCards, members }: Props) {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [newActionItem, setNewActionItem] = useState({ title: '', assigneeId: null as number | null, dueDate: '' })
  const [newDecision, setNewDecision] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await createMeeting(projectId, {
        ...form,
        content: form.content || undefined,
        nextMeetingDate: form.nextMeetingDate || undefined,
        actionItems: form.actionItems.map(a => ({ ...a, dueDate: a.dueDate || undefined })),
        decisions: form.decisions.filter(d => d.trim()),
      })
      const d = res.data.data
      setMeetings((prev) => [{ id: d.id, title: d.title, meetingDate: d.meetingDate, authorNickname: d.authorNickname, actionItemCount: d.actionItems.length, decisionCount: d.decisions.length, createdAt: d.createdAt }, ...prev])
      setShowForm(false)
      setForm(emptyForm())
    } catch { alert('회의록 생성 실패') }
  }

  const handleSelect = async (meetingId: number) => {
    try {
      const res = await getMeeting(meetingId)
      setSelectedMeeting(res.data.data)
    } catch { alert('불러오기 실패') }
  }

  const handleLinkKanban = async (meetingId: number, actionItemId: number) => {
    try {
      const res = await linkActionItemToKanban(projectId, meetingId, actionItemId)
      setSelectedMeeting(res.data.data)
      const cardRes = await getCards(projectId)
      setCards(cardRes.data.data)
      alert('칸반 보드에 추가됐어요! 🗂️')
    } catch { alert('칸반 연동 실패') }
  }

  const handleDelete = async (meetingId: number) => {
    if (!confirm('회의록을 삭제할까요?')) return
    try {
      await deleteMeeting(projectId, meetingId)
      setMeetings((prev) => prev.filter(m => m.id !== meetingId))
      setSelectedMeeting(null)
    } catch { alert('삭제 실패') }
  }

  const grouped = Object.entries(
    meetings.reduce((acc, m) => {
      const key = m.meetingDate.slice(0, 7)
      if (!acc[key]) acc[key] = []
      acc[key].push(m)
      return acc
    }, {} as Record<string, MeetingSummary[]>)
  ).sort(([a], [b]) => b.localeCompare(a))

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        {!selectedMeeting ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700 }}>회의록</h2>
              <button onClick={() => setShowForm(true)} style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600, background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>+ 회의록 작성</button>
            </div>

            {/* 템플릿 */}
            <div style={{ background: '#1f2937', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '12px', color: '#6b6b80', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>빠른 시작 템플릿</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {TEMPLATES.map((tpl) => (
                  <button key={tpl.label} type="button"
                    onClick={() => { setForm({ ...emptyForm(), content: tpl.content, meetingDate: new Date().toISOString().split('T')[0] }); setShowForm(true) }}
                    style={{ padding: '14px', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                    <div style={{ fontSize: '20px', marginBottom: '6px' }}>{tpl.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8e8f0' }}>{tpl.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 날짜별 그룹 */}
            {meetings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: '#1f2937', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <p style={{ color: '#6b6b80', fontSize: '14px' }}>아직 회의록이 없어요</p>
              </div>
            ) : grouped.map(([yearMonth, group]) => {
              const [y, mo] = yearMonth.split('-')
              return (
                <div key={yearMonth}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#6c63ff' }}>{y}년 {parseInt(mo)}월</span>
                    <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '20px', background: 'rgba(108,99,255,0.1)', color: '#6c63ff' }}>{group.length}개</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {group.map((m) => (
                      <div key={m.id} onClick={() => handleSelect(m.id)}
                        style={{ background: '#1f2937', borderRadius: '12px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#e8e8f0', marginBottom: '6px' }}>{m.title}</div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6b6b80' }}>
                              <span>📅 {m.meetingDate}</span>
                              <span>✍️ {m.authorNickname}</span>
                              {m.actionItemCount > 0 && <span style={{ color: '#a78bfa' }}>⚡ 액션 {m.actionItemCount}개</span>}
                              {m.decisionCount > 0 && <span style={{ color: '#4ade80' }}>✅ 결정 {m.decisionCount}개</span>}
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(m.id) }} style={{ background: 'transparent', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: '14px', opacity: 0.6 }}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          /* 회의록 상세 */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setSelectedMeeting(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', color: '#9090a8', cursor: 'pointer', padding: '6px 12px', fontSize: '13px' }}>← 목록</button>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '17px', fontWeight: 700, flex: 1 }}>{selectedMeeting.title}</h2>
              <button onClick={() => handleDelete(selectedMeeting.id)} style={{ background: 'transparent', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: '14px', opacity: 0.6 }}>🗑 삭제</button>
            </div>
            <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div><div style={{ fontSize: '11px', color: '#6b6b80', marginBottom: '4px' }}>회의 날짜</div><div style={{ fontSize: '14px', color: '#e8e8f0' }}>📅 {selectedMeeting.meetingDate}</div></div>
                <div><div style={{ fontSize: '11px', color: '#6b6b80', marginBottom: '4px' }}>작성자</div><div style={{ fontSize: '14px', color: '#e8e8f0' }}>✍️ {selectedMeeting.authorNickname}</div></div>
                {selectedMeeting.nextMeetingDate && <div><div style={{ fontSize: '11px', color: '#6b6b80', marginBottom: '4px' }}>다음 회의</div><div style={{ fontSize: '14px', color: '#a78bfa' }}>📅 {selectedMeeting.nextMeetingDate}</div></div>}
              </div>
              {selectedMeeting.attendees.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#6b6b80', marginBottom: '8px' }}>참석자</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedMeeting.attendees.map(a => (
                      <span key={a.userId} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(108,99,255,0.1)', color: '#a78bfa', border: '1px solid rgba(108,99,255,0.2)' }}>👤 {a.nickname}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedMeeting.content && (
                <div>
                  <div style={{ fontSize: '11px', color: '#6b6b80', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>회의 내용</div>
                  <div style={{ fontSize: '14px', color: '#d1d5db', lineHeight: 1.7, whiteSpace: 'pre-wrap', padding: '16px', background: '#111827', borderRadius: '8px' }}>{selectedMeeting.content}</div>
                </div>
              )}
            </div>
            {selectedMeeting.decisions.length > 0 && (
              <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(74,222,128,0.15)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#4ade80', marginBottom: '14px' }}>✅ 결정 사항</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedMeeting.decisions.map((d, i) => (
                    <div key={d.id} style={{ display: 'flex', gap: '10px', padding: '10px 14px', background: 'rgba(74,222,128,0.05)', borderRadius: '8px', border: '1px solid rgba(74,222,128,0.1)' }}>
                      <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: '14px', color: '#d1d5db' }}>{d.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedMeeting.actionItems.length > 0 && (
              <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(108,99,255,0.15)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#a78bfa', marginBottom: '14px' }}>⚡ 액션 아이템</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedMeeting.actionItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(108,99,255,0.05)', borderRadius: '8px', border: '1px solid rgba(108,99,255,0.1)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', color: '#e8e8f0', marginBottom: '4px' }}>{item.title}</div>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#6b6b80' }}>
                          {item.assigneeNickname && <span>👤 {item.assigneeNickname}</span>}
                          {item.dueDate && <span>📅 {item.dueDate}</span>}
                        </div>
                      </div>
                      {item.linkedToKanban ? (
                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', flexShrink: 0 }}>🗂️ 칸반 연동됨</span>
                      ) : (
                        <button onClick={() => handleLinkKanban(selectedMeeting.id, item.id)}
                          style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '8px', background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', color: 'white', cursor: 'pointer', flexShrink: 0, fontWeight: 600 }}>
                          🗂️ 칸반에 추가
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 회의록 작성 모달 */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, overflowY: 'auto', padding: '24px', animation: 'fadeIn 0.2s ease' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '600px', margin: 'auto', animation: 'fadeUp 0.25s ease' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>📝 회의록 작성</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>회의 제목 *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200}
                    style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>회의 날짜 *</label>
                  <input type="date" value={form.meetingDate} onChange={(e) => setForm({ ...form, meetingDate: e.target.value })} required
                    style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px', colorScheme: 'dark', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>다음 회의 일정</label>
                  <input type="date" value={form.nextMeetingDate} onChange={(e) => setForm({ ...form, nextMeetingDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: form.nextMeetingDate ? '#e8e8f0' : '#6b6b80', fontSize: '14px', colorScheme: 'dark', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>참석자</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {members.map((m) => (
                    <button key={m.userId} type="button"
                      onClick={() => setForm(prev => ({ ...prev, attendeeIds: prev.attendeeIds.includes(m.userId) ? prev.attendeeIds.filter(id => id !== m.userId) : [...prev.attendeeIds, m.userId] }))}
                      style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', background: form.attendeeIds.includes(m.userId) ? 'rgba(108,99,255,0.2)' : 'transparent', borderColor: form.attendeeIds.includes(m.userId) ? '#6c63ff' : 'rgba(255,255,255,0.1)', color: form.attendeeIds.includes(m.userId) ? '#a78bfa' : '#9090a8' }}>
                      {form.attendeeIds.includes(m.userId) ? '✓ ' : ''}{m.nickname}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>회의 내용</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} placeholder="회의 내용을 입력하세요..."
                  style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px', resize: 'none', fontFamily: 'inherit', lineHeight: 1.6, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>결정 사항</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                  {form.decisions.map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 12px', background: '#111827', borderRadius: '8px' }}>
                      <span style={{ flex: 1, fontSize: '13px', color: '#e8e8f0' }}>{d}</span>
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, decisions: prev.decisions.filter((_, j) => j !== i) }))} style={{ background: 'transparent', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={newDecision} onChange={(e) => setNewDecision(e.target.value)} placeholder="결정 사항 입력..."
                    style={{ flex: 1, padding: '8px 12px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#e8e8f0', fontSize: '13px', outline: 'none' }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newDecision.trim()) { setForm(prev => ({ ...prev, decisions: [...prev.decisions, newDecision.trim()] })); setNewDecision('') } } }} />
                  <button type="button" onClick={() => { if (newDecision.trim()) { setForm(prev => ({ ...prev, decisions: [...prev.decisions, newDecision.trim()] })); setNewDecision('') } }}
                    style={{ padding: '8px 14px', fontSize: '12px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', color: '#4ade80', cursor: 'pointer', fontWeight: 600 }}>+ 추가</button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>액션 아이템</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                  {form.actionItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 12px', background: '#111827', borderRadius: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: '#e8e8f0' }}>{item.title}</div>
                        <div style={{ fontSize: '11px', color: '#6b6b80', marginTop: '2px' }}>
                          {members.find(m => m.userId === item.assigneeId)?.nickname && <span>👤 {members.find(m => m.userId === item.assigneeId)?.nickname} </span>}
                          {item.dueDate && <span>📅 {item.dueDate}</span>}
                        </div>
                      </div>
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, actionItems: prev.actionItems.filter((_, j) => j !== i) }))} style={{ background: 'transparent', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '6px' }}>
                  <input type="text" value={newActionItem.title} onChange={(e) => setNewActionItem(prev => ({ ...prev, title: e.target.value }))} placeholder="액션 아이템..."
                    style={{ padding: '8px 12px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#e8e8f0', fontSize: '13px', outline: 'none' }} />
                  <select value={newActionItem.assigneeId || ''} onChange={(e) => setNewActionItem(prev => ({ ...prev, assigneeId: e.target.value ? Number(e.target.value) : null }))}
                    style={{ padding: '8px 10px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: newActionItem.assigneeId ? '#e8e8f0' : '#6b6b80', fontSize: '12px' }}>
                    <option value="">담당자</option>
                    {members.map(m => <option key={m.userId} value={m.userId}>{m.nickname}</option>)}
                  </select>
                  <input type="date" value={newActionItem.dueDate} onChange={(e) => setNewActionItem(prev => ({ ...prev, dueDate: e.target.value }))}
                    style={{ padding: '8px 10px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: newActionItem.dueDate ? '#e8e8f0' : '#6b6b80', fontSize: '12px', colorScheme: 'dark', outline: 'none' }} />
                  <button type="button"
                    onClick={() => { if (newActionItem.title.trim()) { setForm(prev => ({ ...prev, actionItems: [...prev.actionItems, { ...newActionItem }] })); setNewActionItem({ title: '', assigneeId: null, dueDate: '' }) } }}
                    style={{ padding: '8px 14px', fontSize: '12px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '8px', color: '#a78bfa', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>+ 추가</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', fontSize: '13px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#9090a8', cursor: 'pointer' }}>취소</button>
                <button type="submit" style={{ padding: '10px 24px', fontSize: '13px', fontWeight: 600, background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>저장</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}