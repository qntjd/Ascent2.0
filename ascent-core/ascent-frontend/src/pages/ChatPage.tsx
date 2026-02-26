import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getMessages, getChatRoomMembers } from '../api/chat'
import type { ChatMessage, ChatRoomMember } from '../types'
import useAuthStore from '../store/authStore'

export default function ChatPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { accessToken } = useAuthStore()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [members, setMembers] = useState<ChatRoomMember[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const clientRef = useRef<Client | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await getMessages(Number(projectId))
        setMessages(res.data.content.reverse())
      } catch (err) { console.error(err) }
    }
    const fetchMembers = async () => {
      try {
        const res = await getChatRoomMembers(Number(projectId))
        setMembers(res.data)
      } catch (err) { console.error(err) }
    }
    fetchMessages()
    fetchMembers()
  }, [projectId])

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
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
            width: '220px', flexShrink: 0,
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            background: '#0f172a',
            overflowY: 'auto',
            padding: '20px 0',
          }}>
            <div style={{ padding: '0 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b6b80', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                멤버 — {members.length}
              </p>
            </div>

            <div style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {members.map((member) => (
                <div key={member.userId} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', borderRadius: '8px',
                  transition: 'background 0.15s',
                }}>
                  {/* 아바타 */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: avatarColor(member.email),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 600, color: 'white',
                  }}>
                    {avatarInitial(member.email)}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {member.nickname}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 500, padding: '1px 6px',
                        borderRadius: '20px',
                        background: member.role === 'OWNER' ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.06)',
                        color: member.role === 'OWNER' ? '#6c63ff' : '#6b6b80',
                        border: `1px solid ${member.role === 'OWNER' ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                        {member.role === 'OWNER' ? 'OWNER' : 'MEMBER'}
                      </span>
                    </div>
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