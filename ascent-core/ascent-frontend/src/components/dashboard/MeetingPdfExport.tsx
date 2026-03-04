import { useRef } from 'react'
import type { Meeting } from '../../api/meeting'

interface Props {
  meeting: Meeting
  projectTitle?: string
}

export default function MeetingPdfExport({ meeting, projectTitle }: Props) {
  const printRef = useRef<HTMLDivElement>(null)

  const handleExport = async () => {
    const el = printRef.current
    if (!el) return

    // 동적 import — 빌드 사이즈 최적화
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    el.style.display = 'block'
    await new Promise(r => setTimeout(r, 100)) // 렌더 대기

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: el.scrollWidth,
      height: el.scrollHeight,
    })

    el.style.display = 'none'

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pageW = 210
    const pageH = 297
    const margin = 14
    const contentW = pageW - margin * 2
    const imgH = (canvas.height * contentW) / canvas.width

    let y = 0
    while (y < imgH) {
      if (y > 0) pdf.addPage()
      pdf.addImage(imgData, 'PNG', margin, margin, contentW, imgH, undefined, 'FAST', 0)
      y += pageH - margin * 2
    }

    pdf.save(`회의록_${meeting.title}_${meeting.meetingDate}.pdf`)
  }

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      {/* 내보내기 버튼 */}
      <button onClick={handleExport}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontSize: '13px', fontWeight: 600, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '8px', color: '#fbbf24', cursor: 'pointer', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.18)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.1)' }}>
        📄 PDF 내보내기
      </button>

      {/* 숨겨진 PDF 렌더링 영역 */}
      <div ref={printRef} style={{ display: 'none' }}>
        <div style={{
          width: '794px', // A4 
          background: '#fff',
          fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          color: '#111',
          padding: '60px 56px',
          boxSizing: 'border-box',
        }}>

          {/* ── 헤더 ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              {/* 로고 영역 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6c63ff, #63b3ff)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '16px' }}>⚡</span>
                </div>
                <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', color: '#1a1a2e' }}>
                  {projectTitle || 'Ascent'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#888', letterSpacing: '0.3px' }}>PROJECT MANAGEMENT PLATFORM</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>출력일</div>
              <div style={{ fontSize: '12px', color: '#444', fontWeight: 500 }}>{today}</div>
            </div>
          </div>

          {/* ── 제목 배너 ── */}
          <div style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #5a54e8 100%)', borderRadius: '12px', padding: '22px 28px', marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Meeting Minutes</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>{meeting.title}</div>
          </div>

          {/* ── 기본 정보 표 ── */}
          <div style={{ marginBottom: '28px' }}>
            <SectionTitle>기본 정보</SectionTitle>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                {[
                  ['회의 일시', meeting.meetingDate],
                  ['작성자', meeting.authorNickname],
                  ['참석자', meeting.attendees.length > 0 ? meeting.attendees.map(a => a.nickname).join(', ') : '—'],
                  ...(meeting.nextMeetingDate ? [['다음 회의', meeting.nextMeetingDate]] : []),
                ].map(([label, value], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#f8f9fc' : '#fff' }}>
                    <td style={{ width: '130px', padding: '11px 16px', fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>{label}</td>
                    <td style={{ padding: '11px 16px', color: '#222', borderBottom: '1px solid #eee' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── 회의 내용 ── */}
          {meeting.content && (
            <div style={{ marginBottom: '28px' }}>
              <SectionTitle>회의 내용</SectionTitle>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '18px 20px', background: '#fafafa', fontSize: '13px', lineHeight: 1.9, color: '#333', whiteSpace: 'pre-wrap', minHeight: '80px' }}>
                {meeting.content}
              </div>
            </div>
          )}

          {/* ── 결정 사항 ── */}
          {meeting.decisions.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <SectionTitle accent="#16a34a">결정 사항</SectionTitle>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f0fdf4' }}>
                    <th style={{ width: '48px', padding: '10px 16px', textAlign: 'center', borderBottom: '2px solid #bbf7d0', color: '#16a34a', fontWeight: 700, fontSize: '12px' }}>No.</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', borderBottom: '2px solid #bbf7d0', color: '#16a34a', fontWeight: 700, fontSize: '12px' }}>내용</th>
                  </tr>
                </thead>
                <tbody>
                  {meeting.decisions.map((d, i) => (
                    <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fefb' }}>
                      <td style={{ padding: '11px 16px', textAlign: 'center', borderBottom: '1px solid #eee', color: '#16a34a', fontWeight: 700 }}>{i + 1}</td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #eee', color: '#222', lineHeight: 1.6 }}>{d.content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── 액션 아이템 ── */}
          {meeting.actionItems.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <SectionTitle accent="#7c3aed">액션 아이템</SectionTitle>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f5f3ff' }}>
                    {['No.', '내용', '담당자', '마감일', '상태'].map((h, i) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: i === 0 ? 'center' : 'left', borderBottom: '2px solid #ddd8fe', color: '#7c3aed', fontWeight: 700, fontSize: '12px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meeting.actionItems.map((item, i) => (
                    <tr key={item.id} style={{ background: i % 2 === 0 ? '#fff' : '#faf9ff' }}>
                      <td style={{ padding: '11px 14px', textAlign: 'center', borderBottom: '1px solid #eee', color: '#7c3aed', fontWeight: 700 }}>{i + 1}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #eee', color: '#222', lineHeight: 1.5 }}>{item.title}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #eee', color: '#555', whiteSpace: 'nowrap' }}>{item.assigneeNickname || '—'}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #eee', color: '#555', whiteSpace: 'nowrap' }}>{item.dueDate || '—'}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #eee' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: item.linkedToKanban ? '#dcfce7' : '#f3f4f6', color: item.linkedToKanban ? '#16a34a' : '#6b7280', fontWeight: 600 }}>
                          {item.linkedToKanban ? '칸반 연동' : '대기'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── 서명란 ── */}
          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '2px solid #eee', display: 'flex', gap: '24px' }}>
            {['작성자', '검토자', '승인자'].map((role) => (
              <div key={role} style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '32px', fontWeight: 600 }}>{role}</div>
                <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px', fontSize: '11px', color: '#aaa' }}>(서명)</div>
              </div>
            ))}
          </div>

          {/* ── 푸터 ── */}
          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '10px', color: '#bbb', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
            본 문서는 Ascent 프로젝트 관리 플랫폼에서 자동 생성되었습니다.
          </div>
        </div>
      </div>
    </>
  )
}

// 섹션 제목 컴포넌트
function SectionTitle({ children, accent = '#6c63ff' }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      <div style={{ width: '4px', height: '18px', background: accent, borderRadius: '2px', flexShrink: 0 }} />
      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.2px' }}>{children}</span>
      <div style={{ flex: 1, height: '1px', background: '#eee' }} />
    </div>
  )
}