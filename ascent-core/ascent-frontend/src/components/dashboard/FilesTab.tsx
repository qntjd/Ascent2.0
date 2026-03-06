import { useRef, useState } from 'react'
import { uploadFile, deleteFile } from '../../api/file'
import type { ProjectFile } from '../../api/file'
import { formatDate } from './shared'

interface Props {
  projectId: number
  files: ProjectFile[]
  setFiles: React.Dispatch<React.SetStateAction<ProjectFile[]>>
}

export default function FilesTab({ projectId, files, setFiles }: Props) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const getIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('sheet') || type.includes('excel')) return '📊'
    if (type.includes('zip') || type.includes('rar')) return '🗜️'
    return '📁'
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadFile(projectId, file)
      setFiles((prev) => [res.data.data, ...prev])
    } catch { alert('파일 업로드 실패') }
    finally { setUploading(false); if (e.target) e.target.value = '' }
  }

  const handleDelete = async (fileId: number) => {
    if (!confirm('파일을 삭제할까요?')) return
    try {
      await deleteFile(projectId, fileId)
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch { alert('삭제 실패') }
  }

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      a.click()
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>파일 목록 ({files.length})</h3>
            <div>
              <input type="file" ref={fileInputRef} onChange={handleUpload} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 600, background: 'linear-gradient(135deg, #6c63ff, #5a54e8)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', opacity: uploading ? 0.6 : 1 }}>
                {uploading ? '업로드 중...' : '📎 파일 업로드'}
              </button>
            </div>
          </div>
          {files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
              <p style={{ color: '#6b6b80', fontSize: '14px' }}>아직 업로드된 파일이 없어요</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {files.map((file) => (
                <div key={file.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: '#111827', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#111827')}>
                  <div style={{ fontSize: '24px', flexShrink: 0 }}>{getIcon(file.fileType)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#e8e8f0', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.originalName}
                    </span>
                    <div style={{ fontSize: '11px', color: '#6b6b80', marginTop: '2px' }}>
                      {formatSize(file.fileSize)} · {file.uploaderNickname} · {formatDate(file.createdAt)}
                    </div>
                  </div>
                  <button onClick={() => handleDownload(file.url, file.originalName)}
                    style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '6px', color: '#6c63ff', fontSize: '12px', padding: '4px 10px', cursor: 'pointer', flexShrink: 0 }}>
                    다운로드
                  </button>
                  <button onClick={() => handleDelete(file.id)}
                    style={{ background: 'transparent', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: '14px', padding: '4px', opacity: 0.6, flexShrink: 0 }}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}