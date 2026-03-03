import { useState } from 'react'
import { createSchedule, toggleSchedule, deleteSchedule } from '../../api/schedule'
import type { Schedule } from '../../api/schedule'
import type { ProjectMember } from '../../types'

interface Props {
  projectId: number
  schedules: Schedule[]
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>
  members: ProjectMember[]
}

export default function ScheduleTab({ projectId, schedules, setSchedules, members }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', assigneeId: null as number | null })
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear(); const month = date.getMonth()
    return { firstDay: new Date(year, month, 1).getDay(), daysInMonth: new Date(year, month + 1, 0).getDate(), year, month }
  }

  const getSchedulesForDay = (day: number) => {
    const { year, month } = getDaysInMonth(calendarMonth)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return schedules.filter((s) => s.startDate <= dateStr && s.endDate >= dateStr)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await createSchedule(projectId, { ...form, assigneeId: form.assigneeId || null })
      setSchedules((prev) => [...prev, res.data.data])
      setShowForm(false)
      setForm({ title: '', description: '', startDate: '', endDate: '', assigneeId: null })
    } catch { alert('일정 생성 실패') }
  }

  const handleToggle = async (id: number) => {
    try {
      const res = await toggleSchedule(projectId, id)
      setSchedules((prev) => prev.map((s) => s.id === id ? res.data.data : s))
    } catch { alert('상태 변경 실패') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('일정을 삭제할까요?')) return
    try {
      await deleteSchedule(projectId, id)
      setSchedules((prev) => prev.filter((s) => s.id !== id))
    } catch { alert('삭제 실패') }
  }

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(calendarMonth)
  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  const dayNames = ['일','월','화','수','목','금','토']

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        {/* 달력 */}
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
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const daySchedules = getSchedulesForDay(day)
              const today = new Date()
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
              return (
                <div key={day} style={{ minHeight: '64px', padding: '4px', borderRadius: '8px', background: isToday ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.02)', border: isToday ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent', transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}>
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

        {/* 일정 목록 */}
        <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>일정 목록</h3>
            <button onClick={() => setShowForm(true)} style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 600, background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>+ 일정 추가</button>
          </div>
          {schedules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b6b80', fontSize: '14px' }}>📅 아직 일정이 없어요!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {schedules.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: '#111827', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#111827')}>
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
                  <button onClick={() => handleDelete(s.id)} style={{ background: 'transparent', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: '14px', padding: '4px', opacity: 0.6 }}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 일정 추가 모달 */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, animation: 'fadeIn 0.2s ease' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '460px', margin: '0 16px', animation: 'fadeUp 0.25s ease' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>일정 추가</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>제목 *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="일정 제목" required maxLength={100}
                  style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>시작일 *</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required
                    style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px', colorScheme: 'dark', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>종료일 *</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required
                    style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px', colorScheme: 'dark', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>담당자</label>
                <select value={form.assigneeId || ''} onChange={(e) => setForm({ ...form, assigneeId: e.target.value ? Number(e.target.value) : null })}
                  style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: form.assigneeId ? '#e8e8f0' : '#6b6b80', fontSize: '14px' }}>
                  <option value="">담당자 없음</option>
                  {members.map((m) => <option key={m.userId} value={m.userId}>{m.nickname}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9090a8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>설명</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="일정 설명 (선택)" maxLength={500} rows={3}
                  style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px', resize: 'none', fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '9px 18px', fontSize: '13px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#9090a8', cursor: 'pointer' }}>취소</button>
                <button type="submit" style={{ padding: '9px 20px', fontSize: '13px', fontWeight: 600, background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>추가</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}