import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getMessages } from '../api/chat'
import { getProjectMembers, addMemberTag, deleteMemberTag } from '../api/project'
import { getMe } from '../api/user'
import type { ChatMessage, ProjectMember } from '../types'
import useAuthStore from '../store/authStore'

export default function ChatPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { accessToken } = useAuthStore()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [myUserId, setMyUserId] = useState<number | null>(null)
  const [myRole, setMyRole] = useState<'OWNER' | 'MEMBER' | null>(null)
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  // 태그 입력 상태
  const [addingTagUserId, setAddingTagUserId] = useState<number | null>(null)
  const [tagInput, setTagInput] = useState('')

  const clientRef = useRef<Client | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [msgRes, memberRes, meRes] = await Promise.all([
          getMessages(Number(projectId)),
          getProjectMembers(Number(projectId)),
          getMe(),
        ])
        setMessages(msgRes.data.content.reverse())
        setMembers(memberRes.data.data)
        setMyUserId(meRes.data.id)
        const me = memberRes.data.data.find((m: ProjectMember) => m.userId === meRes.data.id)
        if (me) setMyRole(me.role)
      } catch (err) {
        console.error(err)
      }
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || !clientRef.current?.connected) return
    clientRef.current.publish({
      destination: `/app/chat/${projectId}`,
      body: JSON.stringify({ content: input }),
    })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleAddTag = async (targetUserId: number) => {
    if (!tagInput.trim()) return
    try {
      const res = await addMemberTag(Number(projectId), targetUserId, tagInput.trim())
      setMembers((prev) =>
        prev.map((m) => m.userId === targetUserId ? { ...m, tags: res.data.data.tags } : m)
      )
      setTagInput('')
      setAddingTagUserId(null)
    } catch {
      alert('태그 추가 실패 (최대 5개)')
    }
  }

  const handleDeleteTag = async (targetUserId: number, tagId: number) => {
    try {
      const res = await deleteMemberTag(Number(projectId), targetUserId, tagId)
      setMembers((prev) =>
        prev.map((m) => m.userId === targetUserId ? { ...m, tags: res.data.data.tags } : m)
      )
    } catch {
      alert('태그 삭제 실패')
    }
  }

  const tagColors = [
    { bg: 'rgba(108,99,255,0.15)', color: '#a78bfa', border: 'rgba(108,99,255,0.3)' },
    { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
    { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    { bg: 'rgba(236,72,153,0.15)', color: '#f472b6', border: 'rgba(236,72,153,0.3)' },
  ]

  const getTagColor = (index: number) => tagColors[index % tagColors.length]

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

  const isSameDay = (a: string, b: string) =>
    new Date(a).toDateString() === new Date(b).toDateString()

  const avatarColor = (email: string) => {
    const colors = ['#6c63ff', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899']
    let hash = 0
    for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  const avatarInitial = (email: string) => email[0].toUpperCase()

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#111827', fontFamily: "'DM Sans', sans-serif", color: '#e8e8f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        .msg-row { animation: fadeUp 0.2s ease forwards; }
        .sidebar { animation: slideIn 0.25s ease forwards; }
        .send-btn:hover:not(:disabled) { background: #7c74ff !important; box-shadow: 0 4px 16px rgba(108,99,255,0.4) !important; transform: translateY(-1px); }
        .send-btn { transition: all 0.15s ease; }
        .back-btn:hover { color: #e8e8f0 !important; background: rgba(255,255,255,0.06) !important; }
        .back-btn { transition: all 0.15s ease; }
        .toggle-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .toggle-btn { transition: all 0.15s ease; }
        .tag-delete:hover { opacity: 1 !important; }
        .tag-delete { transition: opacity 0.15s; }
        .member-row:hover { background: rgba(255,255,255,0.02) !important; }
        .member-row { transition: background 0.15s; border-radius: 10px; }
        .add-tag-btn:hover { color: #6c63ff !important; border-color: rgba(108,99,255,0.3) !important; }
        .add-tag-btn { transition: all 0.15s; }
        .tag-input:focus { border-color: #6c63ff !important; outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      {/* 헤더 */}
      <div style={{
        background: 'rgba(17,24,39,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 20px', height: '58px',
        display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
      }}>
        <button onClick={() => navigate('/projects')} className="back-btn" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 10px', borderRadius: '8px',
          background: 'transparent', border: 'none',
          color: '#9090a8', cursor: 'pointer', fontSize: '13px',
        }}>← 뒤로</button>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #6c63ff, #63b3ff)',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
          }}>💬</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>채팅방</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: connected ? '#4ade80' : '#f87171',
                boxShadow: connected ? '0 0 6px #4ade80' : 'none',
              }} />
              <span style={{ fontSize: '11px', color: connected ? '#4ade80' : '#f87171' }}>
                {connected ? '연결됨' : '연결 중...'}
              </span>
            </div>
          </div>
        </div>

        <button onClick={() => setShowSidebar(!showSidebar)} className="toggle-btn" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', borderRadius: '8px',
          background: showSidebar ? 'rgba(108,99,255,0.15)' : 'transparent',
          border: `1px solid ${showSidebar ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
          color: showSidebar ? '#6c63ff' : '#9090a8', cursor: 'pointer', fontSize: '12px', fontWeight: 500,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          멤버 {members.length}
        </button>
      </div>

      {/* 바디 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 메시지 영역 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{ fontSize: '48px' }}>💬</div>
              <p style={{ color: '#6b6b80', fontSize: '14px' }}>첫 메시지를 보내보세요!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const showDate = i === 0 || !isSameDay(messages[i - 1].createdAt, msg.createdAt)
              const showAvatar = i === 0 || messages[i - 1].senderEmail !== msg.senderEmail || showDate
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                      <span style={{ fontSize: '11px', color: '#6b6b80', padding: '3px 10px', background: '#1f2937', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {formatDate(msg.createdAt)}
                      </span>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                    </div>
                  )}
                  <div className="msg-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: showAvatar ? '12px' : '2px' }}>
                    <div style={{ width: '32px', flexShrink: 0 }}>
                      {showAvatar && (
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: avatarColor(msg.senderEmail),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 600, color: 'white',
                        }}>
                          {avatarInitial(msg.senderEmail)}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {showAvatar && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: avatarColor(msg.senderEmail) }}>
                            {msg.senderEmail.split('@')[0]}
                          </span>
                          <span style={{ fontSize: '11px', color: '#6b6b80' }}>{formatTime(msg.createdAt)}</span>
                        </div>
                      )}
                      <div style={{
                        display: 'inline-block',
                        background: '#1f2937', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: showAvatar ? '4px 12px 12px 12px' : '12px',
                        padding: '8px 14px', fontSize: '14px', lineHeight: '1.5',
                        color: '#d1d5db', maxWidth: '520px', wordBreak: 'break-word',
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* 멤버 사이드바 */}
        {showSidebar && (
          <div className="sidebar" style={{
            width: '250px', flexShrink: 0,
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            background: '#0f172a', overflowY: 'auto',
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b6b80', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                멤버 — {members.length}
              </p>
              {myRole === 'OWNER' && (
                <p style={{ fontSize: '11px', color: '#6c63ff', marginTop: '4px' }}>
                  + 버튼으로 역할 태그 추가
                </p>
              )}
            </div>

            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {members.map((member) => (
                <div key={member.userId} className="member-row" style={{ padding: '10px' }}>
                  {/* 아바타 + 이름 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                      background: avatarColor(member.email),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 600, color: 'white',
                    }}>
                      {avatarInitial(member.email)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.nickname}
                        {member.userId === myUserId && (
                          <span style={{ fontSize: '10px', color: '#6b6b80', marginLeft: '4px' }}>(나)</span>
                        )}
                      </div>
                      <span style={{
                        fontSize: '10px', fontWeight: 500, padding: '1px 6px', borderRadius: '20px',
                        background: member.role === 'OWNER' ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.06)',
                        color: member.role === 'OWNER' ? '#6c63ff' : '#6b6b80',
                        border: `1px solid ${member.role === 'OWNER' ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* 태그 목록 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingLeft: '38px' }}>
                    {member.tags.map((tag, idx) => {
                      const color = getTagColor(idx)
                      return (
                        <span key={tag.id} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          fontSize: '11px', fontWeight: 500,
                          padding: '2px 8px', borderRadius: '20px',
                          background: color.bg, color: color.color, border: `1px solid ${color.border}`,
                        }}>
                          {tag.tag}
                          {myRole === 'OWNER' && (
                            <button onClick={() => handleDeleteTag(member.userId, tag.id)} className="tag-delete" style={{
                              background: 'transparent', border: 'none',
                              color: color.color, cursor: 'pointer',
                              fontSize: '10px', padding: '0', lineHeight: 1,
                              opacity: 0.6, marginLeft: '1px',
                            }}>✕</button>
                          )}
                        </span>
                      )
                    })}

                    {/* 태그 추가 버튼/입력 */}
                    {myRole === 'OWNER' && member.tags.length < 5 && (
                      addingTagUserId === member.userId ? (
                        <div style={{ display: 'flex', gap: '3px', marginTop: '2px', width: '100%' }}>
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="태그 입력..."
                            maxLength={30}
                            className="tag-input"
                            autoFocus
                            style={{
                              flex: 1, padding: '3px 8px', fontSize: '11px',
                              background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '20px', color: '#e8e8f0',
                              transition: 'border-color 0.2s',
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddTag(member.userId)
                              if (e.key === 'Escape') { setAddingTagUserId(null); setTagInput('') }
                            }}
                          />
                          <button onClick={() => handleAddTag(member.userId)} style={{
                            padding: '3px 8px', fontSize: '11px',
                            background: '#6c63ff', border: 'none',
                            borderRadius: '20px', color: 'white', cursor: 'pointer',
                          }}>+</button>
                          <button onClick={() => { setAddingTagUserId(null); setTagInput('') }} style={{
                            padding: '3px 6px', fontSize: '11px',
                            background: 'rgba(255,255,255,0.06)', border: 'none',
                            borderRadius: '20px', color: '#9090a8', cursor: 'pointer',
                          }}>✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddingTagUserId(member.userId); setTagInput('') }}
                          className="add-tag-btn"
                          style={{
                            fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                            background: 'transparent',
                            border: '1px dashed rgba(255,255,255,0.15)',
                            color: '#6b6b80', cursor: 'pointer',
                          }}
                        >+ 태그</button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 입력창 */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#111827', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '6px 6px 6px 16px',
        }}>
          <input
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? "메시지를 입력하세요..." : "연결 중..."}
            disabled={!connected}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: '#e8e8f0', fontSize: '14px', outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button onClick={handleSend} disabled={!connected || !input.trim()} className="send-btn" style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: input.trim() && connected ? 'linear-gradient(135deg, #6c63ff, #5a54e8)' : 'rgba(255,255,255,0.06)',
            border: 'none', borderRadius: '8px',
            cursor: input.trim() && connected ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: input.trim() && connected ? '0 2px 8px rgba(108,99,255,0.3)' : 'none',
            transition: 'all 0.2s ease',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#4b5563', marginTop: '8px' }}>
          Enter로 전송 · Shift+Enter 줄바꿈
        </p>
      </div>
    </div>
  )
}