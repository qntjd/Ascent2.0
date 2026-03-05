import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { uploadFile } from '../../api/file'
import type { ProjectFile } from '../../api/file'
import type { ChatMessage } from '../../types'
import { avatarColor, formatDate, formatTime } from './shared'
import useAuthStore from '../../store/authStore'

interface Props {
  projectId: number
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  setFiles: React.Dispatch<React.SetStateAction<ProjectFile[]>>
}

export default function ChatTab({ projectId, messages, setMessages, setFiles }: Props) {
  const { accessToken } = useAuthStore()
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [uploading, setUploading] = useState(false)
  const clientRef = useRef<Client | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || ''
    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsUrl}/ws`),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      onConnect: () => {
        setConnected(true)
        client.subscribe(`/topic/chat/${projectId}`, (msg) => {
          setMessages((prev) => [...prev, JSON.parse(msg.body)])
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
    clientRef.current.publish({ destination: `/app/chat/${projectId}`, body: JSON.stringify({ content: input }) })
    setInput('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      // 1. Cloudinary에 파일 업로드
      const res = await uploadFile(projectId, file)
      const uploaded = res.data.data
      setFiles((prev) => [uploaded, ...prev])

      // 2. WebSocket으로 파일 메시지 브로드캐스트
      if (clientRef.current?.connected) {
        clientRef.current.publish({
          destination: `/app/chat/${projectId}/file`,
          body: JSON.stringify({ fileUrl: uploaded.url, fileName: uploaded.originalName }),
        })
      }
    } catch { alert('파일 업로드 실패') }
    finally { setUploading(false); if (e.target) e.target.value = '' }
  }

  const isSameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString()

  const isImage = (fileName: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)

  return (
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
          const isFile = msg.messageType === 'FILE'
          const isImg = isFile && msg.fileName && isImage(msg.fileName)

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
                  {showAvatar && (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: avatarColor(msg.senderEmail), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'white' }}>
                      {msg.senderEmail[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {showAvatar && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: avatarColor(msg.senderEmail) }}>
                        {msg.senderNickname || msg.senderEmail.split('@')[0]}
                      </span>
                      <span style={{ fontSize: '11px', color: '#6b6b80' }}>{formatTime(msg.createdAt)}</span>
                    </div>
                  )}

                  {/* 이미지 메시지 */}
                  {isImg && msg.fileUrl && (
                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                      <img src={msg.fileUrl} alt={msg.fileName ?? '이미지'}
                        style={{ maxWidth: '320px', maxHeight: '240px', borderRadius: '10px', display: 'block', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', objectFit: 'cover' }} />
                    </a>
                  )}

                  {/* 일반 파일 메시지 */}
                  {isFile && !isImg && msg.fileUrl && (
                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#1f2937', border: '1px solid rgba(108,99,255,0.2)', borderRadius: showAvatar ? '4px 12px 12px 12px' : '12px', padding: '10px 14px', textDecoration: 'none', maxWidth: '320px' }}>
                      <span style={{ fontSize: '22px' }}>📎</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', color: '#e8e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{msg.fileName}</div>
                        <div style={{ fontSize: '11px', color: '#6c63ff', marginTop: '2px' }}>클릭해서 열기 →</div>
                      </div>
                    </a>
                  )}

                  {/* 텍스트 메시지 */}
                  {!isFile && (
                    <div style={{ display: 'inline-block', background: '#1f2937', border: '1px solid rgba(255,255,255,0.06)', borderRadius: showAvatar ? '4px 12px 12px 12px' : '12px', padding: '8px 14px', fontSize: '14px', lineHeight: '1.5', color: '#d1d5db', maxWidth: '520px', wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '6px 6px 6px 12px' }}>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            style={{ background: 'transparent', border: 'none', color: uploading ? '#6c63ff' : '#6b6b80', cursor: 'pointer', fontSize: '18px', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#6c63ff')}
            onMouseLeave={e => { if (!uploading) e.currentTarget.style.color = '#6b6b80' }}>
            {uploading ? '⏳' : '📎'}
          </button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder={connected ? '메시지를 입력하세요...' : '연결 중...'}
            disabled={!connected}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#e8e8f0', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
          <button onClick={handleSend} disabled={!connected || !input.trim()}
            style={{ width: '36px', height: '36px', background: input.trim() && connected ? 'linear-gradient(135deg, #6c63ff, #5a54e8)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', cursor: input.trim() && connected ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}