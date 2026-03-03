import { useState } from 'react'
import { createCard, moveCard, deleteCard } from '../../api/kanban'
import { createSchedule } from '../../api/schedule'
import type { KanbanCard } from '../../api/kanban'
import type { Schedule } from '../../api/schedule'
import type { ProjectMember } from '../../types'
import { COLUMNS, PRIORITY_MAP } from './shared'

interface Props {
  projectId: number
  cards: KanbanCard[]
  setCards: React.Dispatch<React.SetStateAction<KanbanCard[]>>
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>
  members: ProjectMember[]
}

export default function KanbanTab({ projectId, cards, setCards, setSchedules, members }: Props) {
  const [showCardForm, setShowCardForm] = useState<'TODO' | 'IN_PROGRESS' | 'DONE' | null>(null)
  const [cardForm, setCardForm] = useState({ title: '', description: '', priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH', dueDate: '', assigneeId: null as number | null })
  const [dragCardId, setDragCardId] = useState<number | null>(null)
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleStartDate, setScheduleStartDate] = useState('')

  const getColCards = (status: 'TODO' | 'IN_PROGRESS' | 'DONE') =>
    cards.filter((c) => c.status === status).sort((a, b) => a.position - b.position)

  const handleCreate = async (colStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (!cardForm.title.trim()) return
    try {
      const res = await createCard(projectId, { status: colStatus, title: cardForm.title, description: cardForm.description || undefined, priority: cardForm.priority, dueDate: cardForm.dueDate || undefined, assigneeId: cardForm.assigneeId || null })
      setCards((prev) => [...prev, res.data.data])
      setShowCardForm(null)
      setCardForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: null })
    } catch { alert('카드 생성 실패') }
  }

  const handleMove = async (cardId: number, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      const res = await moveCard(projectId, cardId, { status: newStatus, position: 999 })
      setCards((prev) => prev.map((c) => c.id === cardId ? res.data.data : c))
      if (selectedCard?.id === cardId) setSelectedCard(res.data.data)
    } catch { alert('이동 실패') }
  }

  const handleDelete = async (cardId: number) => {
    if (!confirm('카드를 삭제할까요?')) return
    try {
      await deleteCard(projectId, cardId)
      setCards((prev) => prev.filter((c) => c.id !== cardId))
      if (selectedCard?.id === cardId) setSelectedCard(null)
    } catch { alert('삭제 실패') }
  }

  const handleAddToSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCard) return
    try {
      const res = await createSchedule(projectId, { title: selectedCard.title, description: selectedCard.description || '', startDate: scheduleStartDate, endDate: selectedCard.dueDate || scheduleStartDate, assigneeId: selectedCard.assigneeId || null })
      setSchedules((prev) => [...prev, res.data.data])
      setShowScheduleForm(false)
      setSelectedCard(null)
      alert('일정에 추가됐어요! 📅 일정 탭에서 확인하세요.')
    } catch { alert('일정 추가 실패') }
  }

  const handleDrop = (status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (dragCardId == null) return
    handleMove(dragCardId, status)
    setDragCardId(null)
  }

  return (
    <>
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', height: '100%', minWidth: '720px' }}>
          {COLUMNS.map((col) => {
            const colCards = getColCards(col.key)
            return (
              <div key={col.key}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = 'rgba(108,99,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)' }}
                onDragLeave={(e) => { e.currentTarget.style.background = col.bg; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                onDrop={(e) => { e.currentTarget.style.background = col.bg; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; handleDrop(col.key) }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', background: col.bg, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', transition: 'background 0.15s, border-color 0.15s' }}>
                {/* 컬럼 헤더 */}
                <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: col.color }}>{col.label}</span>
                      <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', color: '#6b6b80' }}>{colCards.length}</span>
                    </div>
                    <button onClick={() => { setShowCardForm(col.key); setCardForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: null }) }}
                      style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', color: '#9090a8', cursor: 'pointer', fontSize: '16px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
                {/* 카드 목록 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {colCards.map((card) => {
                    const p = PRIORITY_MAP[card.priority]
                    const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && card.status !== 'DONE'
                    return (
                      <div key={card.id} draggable
                        onClick={() => { setSelectedCard(card); setShowScheduleForm(false); setScheduleStartDate(card.dueDate || '') }}
                        onDragStart={(e) => { e.stopPropagation(); setDragCardId(card.id) }}
                        style={{ background: '#1f2937', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#e8e8f0', lineHeight: 1.4, flex: 1 }}>{card.title}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(card.id) }} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '12px', padding: '0', opacity: 0.6 }}>✕</button>
                        </div>
                        {card.description && <p style={{ fontSize: '12px', color: '#9090a8', marginBottom: '8px', lineHeight: 1.4 }}>{card.description}</p>}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: p.bg, color: p.color, fontWeight: 500 }}>{p.label}</span>
                          {card.assigneeNickname && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: 'rgba(108,99,255,0.1)', color: '#a78bfa' }}>👤 {card.assigneeNickname}</span>}
                          {card.dueDate && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: isOverdue ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.06)', color: isOverdue ? '#f87171' : '#6b6b80' }}>📅 {card.dueDate}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                          {COLUMNS.filter((c) => c.key !== col.key).map((target) => (
                            <button key={target.key} onClick={(e) => { e.stopPropagation(); handleMove(card.id, target.key) }}
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
                        placeholder="카드 제목..." maxLength={100} autoFocus
                        style={{ width: '100%', padding: '7px 10px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: '#e8e8f0', fontSize: '13px', marginBottom: '8px', outline: 'none' }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(col.key); if (e.key === 'Escape') setShowCardForm(null) }} />
                      <textarea value={cardForm.description} onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                        placeholder="설명 (선택)" rows={2}
                        style={{ width: '100%', padding: '7px 10px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: '#e8e8f0', fontSize: '12px', resize: 'none', fontFamily: 'inherit', marginBottom: '8px', outline: 'none' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                        <select value={cardForm.priority} onChange={(e) => setCardForm({ ...cardForm, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })}
                          style={{ padding: '6px 8px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: '#e8e8f0', fontSize: '12px' }}>
                          <option value="LOW">낮음</option><option value="MEDIUM">중간</option><option value="HIGH">높음</option>
                        </select>
                        <select value={cardForm.assigneeId || ''} onChange={(e) => setCardForm({ ...cardForm, assigneeId: e.target.value ? Number(e.target.value) : null })}
                          style={{ padding: '6px 8px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: cardForm.assigneeId ? '#e8e8f0' : '#6b6b80', fontSize: '12px' }}>
                          <option value="">담당자</option>
                          {members.map((m) => <option key={m.userId} value={m.userId}>{m.nickname}</option>)}
                        </select>
                      </div>
                      <input type="date" value={cardForm.dueDate} onChange={(e) => setCardForm({ ...cardForm, dueDate: e.target.value })}
                        style={{ width: '100%', padding: '6px 8px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: cardForm.dueDate ? '#e8e8f0' : '#6b6b80', fontSize: '12px', colorScheme: 'dark', marginBottom: '8px', outline: 'none' }} />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleCreate(col.key)} style={{ flex: 1, padding: '7px', fontSize: '12px', fontWeight: 600, background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', borderRadius: '7px', color: 'white', cursor: 'pointer' }}>추가</button>
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

      {/* 카드 상세 모달 */}
      {selectedCard && (
        <div onClick={() => { setSelectedCard(null); setShowScheduleForm(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, animation: 'fadeIn 0.2s ease' }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '460px', margin: '0 16px', animation: 'fadeUp 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: PRIORITY_MAP[selectedCard.priority].bg, color: PRIORITY_MAP[selectedCard.priority].color, fontWeight: 500 }}>{PRIORITY_MAP[selectedCard.priority].label}</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: COLUMNS.find(c => c.key === selectedCard.status)?.bg, color: COLUMNS.find(c => c.key === selectedCard.status)?.color }}>{COLUMNS.find(c => c.key === selectedCard.status)?.label}</span>
                </div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, color: '#e8e8f0', lineHeight: 1.3 }}>{selectedCard.title}</h2>
              </div>
              <button onClick={() => { setSelectedCard(null); setShowScheduleForm(false) }} style={{ background: 'transparent', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: '18px', padding: '0 0 0 12px' }}>✕</button>
            </div>
            {selectedCard.description && <p style={{ fontSize: '14px', color: '#9090a8', lineHeight: 1.6, marginBottom: '16px', padding: '12px', background: '#111827', borderRadius: '8px' }}>{selectedCard.description}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {selectedCard.assigneeNickname && <div style={{ padding: '10px 12px', background: '#111827', borderRadius: '8px' }}><div style={{ fontSize: '11px', color: '#6b6b80', marginBottom: '4px' }}>담당자</div><div style={{ fontSize: '13px', color: '#e8e8f0' }}>👤 {selectedCard.assigneeNickname}</div></div>}
              {selectedCard.dueDate && <div style={{ padding: '10px 12px', background: '#111827', borderRadius: '8px' }}><div style={{ fontSize: '11px', color: '#6b6b80', marginBottom: '4px' }}>마감일</div><div style={{ fontSize: '13px', color: new Date(selectedCard.dueDate) < new Date() && selectedCard.status !== 'DONE' ? '#f87171' : '#e8e8f0' }}>📅 {selectedCard.dueDate}</div></div>}
            </div>
            {!showScheduleForm ? (
              <button onClick={() => { setShowScheduleForm(true); setScheduleStartDate(selectedCard.dueDate || '') }}
                style={{ width: '100%', padding: '11px', fontSize: '13px', fontWeight: 600, background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>
                📅 일정에 추가
              </button>
            ) : (
              <form onSubmit={handleAddToSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: '#111827', borderRadius: '10px', border: '1px solid rgba(108,99,255,0.2)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#a78bfa' }}>📅 일정으로 추가</div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px' }}>시작일 *</label>
                  <input type="date" value={scheduleStartDate} onChange={(e) => setScheduleStartDate(e.target.value)} required
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#e8e8f0', fontSize: '13px', colorScheme: 'dark', outline: 'none' }} />
                </div>
                {selectedCard.dueDate && (
                  <div style={{ fontSize: '12px', color: '#6b6b80', padding: '8px 10px', background: 'rgba(108,99,255,0.08)', borderRadius: '6px' }}>
                    종료일: <span style={{ color: '#a78bfa' }}>{selectedCard.dueDate}</span> (마감일 자동 적용)
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" style={{ flex: 1, padding: '9px', fontSize: '13px', fontWeight: 600, background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>추가</button>
                  <button type="button" onClick={() => setShowScheduleForm(false)} style={{ padding: '9px 14px', fontSize: '13px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#9090a8', cursor: 'pointer' }}>취소</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}