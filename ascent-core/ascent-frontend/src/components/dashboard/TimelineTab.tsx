import { useState, useMemo } from 'react'
import type { Schedule } from '../../api/schedule'
import type { MeetingSummary } from '../../api/meeting'
import type { ProjectMember } from '../../types'
import { avatarColor } from './shared'

interface Props {
  schedules: Schedule[]
  meetings: MeetingSummary[]
  members: ProjectMember[]
}

type TimelineItem =
  | { kind: 'schedule'; date: string; data: Schedule }
  | { kind: 'meeting';  date: string; data: MeetingSummary }

export default function TimelineTab({ schedules, meetings, members }: Props) {
  const [filterAssignee, setFilterAssignee] = useState<number | 'all'>('all')
  const [filterType, setFilterType] = useState<'ALL' | 'SCHEDULE' | 'MEETING'>('ALL')

  const items = useMemo<TimelineItem[]>(() => {
    const result: TimelineItem[] = []

    if (filterType !== 'MEETING') {
      schedules
        .filter((s) => filterAssignee === 'all' || s.assigneeId === filterAssignee)
        .forEach((s) => result.push({ kind: 'schedule', date: s.startDate, data: s }))
    }

    if (filterType !== 'SCHEDULE') {
      meetings.forEach((m) => result.push({ kind: 'meeting', date: m.meetingDate, data: m }))
    }

    return result.sort((a, b) => (a.date > b.date ? -1 : 1))
  }, [schedules, meetings, filterAssignee, filterType])

  // 날짜별로 그룹핑
  const grouped = useMemo(() => {
    const map = new Map<string, TimelineItem[]>()
    items.forEach((item) => {
      const key = item.date.slice(0, 7) // YYYY-MM
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    })
    return Array.from(map.entries())
  }, [items])

  const formatMonthLabel = (key: string) => {
    const [year, month] = key.split('-')
    return `${year}년 ${Number(month)}월`
  }

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  }

  const isToday = (dateStr: string) => {
    return new Date().toISOString().slice(0, 10) === dateStr
  }

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date(new Date().toISOString().slice(0, 10))
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* 헤더 + 필터 */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e8e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🕐</span> 타임라인
          </h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* 타입 필터 */}
            {(['ALL', 'SCHEDULE', 'MEETING'] as const).map((t) => (
              <button key={t} onClick={() => setFilterType(t)}
                style={{
                  padding: '6px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '20px', cursor: 'pointer', transition: 'all 0.15s',
                  background: filterType === t ? 'rgba(108,99,255,0.2)' : 'transparent',
                  border: filterType === t ? '1px solid rgba(108,99,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  color: filterType === t ? '#a78bfa' : '#6b6b80',
                }}>
                {t === 'ALL' ? '전체' : t === 'SCHEDULE' ? '📅 일정' : '📋 회의록'}
              </button>
            ))}

            {/* 담당자 필터 */}
            <select value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              style={{ padding: '6px 12px', fontSize: '12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', color: filterAssignee === 'all' ? '#6b6b80' : '#e8e8f0', cursor: 'pointer' }}>
              <option value="all">👤 전체 담당자</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.nickname}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 타임라인 */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#1f2937', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕐</div>
            <p style={{ color: '#6b6b80', fontSize: '14px' }}>표시할 항목이 없어요</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* 세로 줄 */}
            <div style={{ position: 'absolute', left: '119px', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.06)', zIndex: 0 }} />

            {grouped.map(([monthKey, monthItems]) => (
              <div key={monthKey} style={{ marginBottom: '32px' }}>
                {/* 월 레이블 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '100px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#6c63ff', letterSpacing: '0.05em' }}>
                    {formatMonthLabel(monthKey)}
                  </div>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#6c63ff', border: '3px solid #111827', zIndex: 1, flexShrink: 0 }} />
                  <div style={{ flex: 1, height: '1px', background: 'rgba(108,99,255,0.3)' }} />
                </div>

                {/* 아이템들 */}
                {monthItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    {/* 날짜 */}
                    <div style={{ width: '100px', textAlign: 'right', paddingTop: '14px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', color: isToday(item.date) ? '#6c63ff' : isPast(item.date) ? '#4b4b5e' : '#9090a8', fontWeight: isToday(item.date) ? 700 : 400 }}>
                        {isToday(item.date) ? '오늘' : formatDateLabel(item.date)}
                      </span>
                    </div>

                    {/* 도트 */}
                    <div style={{ flexShrink: 0, position: 'relative', zIndex: 1, paddingTop: '16px' }}>
                      <div style={{
                        width: '12px', height: '12px', borderRadius: '50%',
                        background: item.kind === 'schedule'
                          ? (item.data as Schedule).completed ? '#4ade80' : isToday(item.date) ? '#6c63ff' : isPast(item.date) ? '#2d2d3d' : '#fbbf24'
                          : '#60a5fa',
                        border: `2px solid #111827`,
                        boxShadow: isToday(item.date) ? '0 0 8px rgba(108,99,255,0.6)' : 'none',
                      }} />
                    </div>

                    {/* 카드 */}
                    {item.kind === 'schedule'
                      ? <ScheduleCard schedule={item.data as Schedule} />
                      : <MeetingCard meeting={item.data as MeetingSummary} />
                    }
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const [open, setOpen] = useState(false)

  return (
    <div onClick={() => setOpen(!open)}
      style={{
        flex: 1, background: '#1f2937', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px',
        padding: '12px 16px', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
        opacity: schedule.completed ? 0.6 : 1,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = '#252f3d' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = '#1f2937' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px' }}>📅</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: schedule.completed ? '#6b6b80' : '#e8e8f0', flex: 1, textDecoration: schedule.completed ? 'line-through' : 'none' }}>
          {schedule.title}
        </span>
        {schedule.completed && (
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>완료</span>
        )}
      </div>

      {open && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {schedule.description && (
            <p style={{ fontSize: '12px', color: '#9090a8', margin: 0 }}>{schedule.description}</p>
          )}
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#6b6b80' }}>
            <span>📅 {schedule.startDate} ~ {schedule.endDate}</span>
            {schedule.assigneeNickname && <span>👤 {schedule.assigneeNickname}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

function MeetingCard({ meeting }: { meeting: MeetingSummary }) {
  const [open, setOpen] = useState(false)
  const authorColor = avatarColor(meeting.authorNickname || 'user')

  return (
    <div onClick={() => setOpen(!open)}
      style={{
        flex: 1, background: '#1f2937', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px',
        padding: '12px 16px', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)'; e.currentTarget.style.background = '#252f3d' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.15)'; e.currentTarget.style.background = '#1f2937' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px' }}>📋</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#e8e8f0', flex: 1 }}>{meeting.title}</span>
        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>회의록</span>
      </div>

      {open && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#6b6b80' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: authorColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white', fontWeight: 700 }}>
                {meeting.authorNickname?.[0]?.toUpperCase()}
              </div>
              {meeting.authorNickname}
            </span>
            {meeting.actionItemCount > 0 && <span>✅ 액션 아이템 {meeting.actionItemCount}개</span>}
            {meeting.decisionCount > 0 && <span>📌 결정사항 {meeting.decisionCount}개</span>}
          </div>
        </div>
      )}
    </div>
  )
}