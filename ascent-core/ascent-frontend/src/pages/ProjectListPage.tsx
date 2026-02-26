import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, createProject, createInviteCode, joinProject } from '../api/project'
import type { Project } from '../types'
import useAuthStore from '../store/authStore'

export default function ProjectListPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const fetchProjects = async () => {
    try {
      const res = await getProjects()
      setProjects(res.data.content)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProject(title, description)
      setShowCreate(false)
      setTitle(''); setDescription('')
      fetchProjects()
    } catch { alert('프로젝트 생성 실패') }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await joinProject(inviteCode)
      setShowJoin(false); setInviteCode('')
      fetchProjects()
    } catch { alert('유효하지 않거나 만료된 초대 코드예요.') }
  }

  const handleInviteCode = async (projectId: number) => {
    try {
      const res = await createInviteCode(projectId)
      navigator.clipboard.writeText(res.data.code)
      alert(`초대 코드 복사됨!\n${res.data.code}`)
    } catch { alert('초대 코드 생성 실패 (OWNER만 가능)') }
  }

  const statusColor: Record<string, string> = {
    OPEN: '#4ade80',
    CLOSED: '#f87171',
    ARCHIVED: '#9090a8',
  }

  const statusLabel: Record<string, string> = {
    OPEN: '진행 중',
    CLOSED: '종료',
    ARCHIVED: '보관',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111827', fontFamily: "'DM Sans', sans-serif", color: '#e8e8f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .project-card { animation: fadeUp 0.4s ease forwards; transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
        .project-card:hover { transform: translateY(-3px); border-color: rgba(108,99,255,0.3) !important; box-shadow: 0 8px 32px rgba(108,99,255,0.1) !important; }
        .btn-primary:hover { background: #7c74ff !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,99,255,0.4) !important; }
        .btn-primary { transition: all 0.2s ease; }
        .btn-ghost:hover { background: rgba(255,255,255,0.06) !important; }
        .btn-ghost { transition: all 0.15s ease; }
        .btn-outline:hover { border-color: rgba(108,99,255,0.5) !important; color: #6c63ff !important; }
        .btn-outline { transition: all 0.15s ease; }
        .input-field:focus { border-color: #6c63ff !important; box-shadow: 0 0 0 3px rgba(108,99,255,0.15) !important; outline: none; }
        .modal-overlay { animation: fadeIn 0.2s ease; }
        .modal-content { animation: fadeUp 0.25s ease; }
        textarea:focus { border-color: #6c63ff !important; box-shadow: 0 0 0 3px rgba(108,99,255,0.15) !important; outline: none; }
      `}</style>

      {/* 네비게이션 */}
      <nav style={{
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px',
            background: 'linear-gradient(135deg, #6c63ff, #63b3ff)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Ascent
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setShowJoin(true)} className="btn-outline" style={{
            padding: '7px 16px', fontSize: '13px', fontWeight: 500,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px', color: '#9090a8', cursor: 'pointer',
          }}>
            초대 코드 참여
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary" style={{
            padding: '7px 16px', fontSize: '13px', fontWeight: 600,
            background: 'linear-gradient(135deg, #6c63ff, #5a54e8)',
            border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
          }}>
            + 새 프로젝트
          </button>
          <button onClick={logout} className="btn-ghost" style={{
            padding: '7px 12px', fontSize: '13px',
            background: 'transparent', border: 'none',
            borderRadius: '8px', color: '#6b6b80', cursor: 'pointer',
          }}>
            로그아웃
          </button>
        </div>
      </nav>

      {/* 메인 */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
            프로젝트
          </h1>
          <p style={{ color: '#6b6b80', fontSize: '14px' }}>
            {projects.length > 0 ? `${projects.length}개의 프로젝트` : '아직 프로젝트가 없어요'}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '16px',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚀</div>
            <p style={{ color: '#6b6b80', fontSize: '15px', marginBottom: '20px' }}>첫 프로젝트를 만들어보세요!</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary" style={{
              padding: '10px 24px', fontSize: '14px', fontWeight: 600,
              background: 'linear-gradient(135deg, #6c63ff, #5a54e8)',
              border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
            }}>
              + 새 프로젝트
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {projects.map((project, i) => (
              <div key={project.id} className="project-card" style={{
                background: '#1f2937',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '22px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                animationDelay: `${i * 0.05}s`,
                opacity: 0,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e8e8f0' }}>{project.title}</h3>
                    <span style={{
                      fontSize: '11px', fontWeight: 500, padding: '2px 8px',
                      borderRadius: '20px', background: `${statusColor[project.status]}18`,
                      color: statusColor[project.status], border: `1px solid ${statusColor[project.status]}30`,
                    }}>
                      {statusLabel[project.status]}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b6b80', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                    {project.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
                  <button onClick={() => handleInviteCode(project.id)} className="btn-ghost" style={{
                    padding: '7px 14px', fontSize: '12px', fontWeight: 500,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', color: '#9090a8', cursor: 'pointer',
                  }}>
                    초대 코드
                  </button>
                  <button onClick={() => navigate(`/projects/${project.id}/chat`)} className="btn-primary" style={{
                    padding: '7px 16px', fontSize: '12px', fontWeight: 600,
                    background: 'linear-gradient(135deg, #6c63ff, #5a54e8)',
                    border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(108,99,255,0.3)',
                  }}>
                    채팅방 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 프로젝트 생성 모달 */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px', margin: '0 16px',
          }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.3px' }}>
              새 프로젝트
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#9090a8', marginBottom: '8px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>제목</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field"
                  placeholder="프로젝트 이름" required maxLength={100}
                  style={{ width: '100%', padding: '11px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px', transition: 'all 0.2s' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#9090a8', marginBottom: '8px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>설명</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="프로젝트에 대해 설명해주세요" required maxLength={2000} rows={3}
                  style={{ width: '100%', padding: '11px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '14px', resize: 'none', transition: 'all 0.2s', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost" style={{
                  padding: '9px 18px', fontSize: '13px', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#9090a8', cursor: 'pointer',
                }}>취소</button>
                <button type="submit" className="btn-primary" style={{
                  padding: '9px 20px', fontSize: '13px', fontWeight: 600,
                  background: 'linear-gradient(135deg, #6c63ff, #5a54e8)',
                  border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
                }}>생성</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 초대 코드 참여 모달 */}
      {showJoin && (
        <div className="modal-overlay" onClick={() => setShowJoin(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px', margin: '0 16px',
          }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.3px' }}>
              초대 코드로 참여
            </h2>
            <p style={{ color: '#6b6b80', fontSize: '13px', marginBottom: '24px' }}>받은 초대 코드를 입력해 프로젝트에 참여하세요</p>
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className="input-field"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required
                style={{ width: '100%', padding: '11px 14px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e8e8f0', fontSize: '13px', fontFamily: 'monospace', transition: 'all 0.2s' }} />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowJoin(false)} className="btn-ghost" style={{
                  padding: '9px 18px', fontSize: '13px', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#9090a8', cursor: 'pointer',
                }}>취소</button>
                <button type="submit" className="btn-primary" style={{
                  padding: '9px 20px', fontSize: '13px', fontWeight: 600,
                  background: 'linear-gradient(135deg, #6c63ff, #5a54e8)',
                  border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
                }}>참여</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}