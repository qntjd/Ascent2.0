import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../api/auth'

export default function SignupPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(email, password, nickname)
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111827',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #1f2937 inset !important;
          -webkit-text-fill-color: #e8e8f0 !important;
        }
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-30px) rotate(5deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(20px) rotate(-5deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .signup-card { animation: fadeUp 0.6s ease forwards; }
        .input-field:focus { border-color: #6c63ff !important; box-shadow: 0 0 0 3px rgba(108,99,255,0.15) !important; }
        .submit-btn:hover:not(:disabled) { background: #7c74ff !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(108,99,255,0.4) !important; }
        .submit-btn { transition: all 0.2s ease; }
      `}</style>

      <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', top:'-100px', left:'-100px', animation:'float1 8s ease-in-out infinite' }} />
      <div style={{ position:'absolute', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,179,255,0.08) 0%, transparent 70%)', bottom:'-80px', right:'-80px', animation:'float2 10s ease-in-out infinite' }} />

      <div className="signup-card" style={{ width: '100%', maxWidth: '420px', padding: '0 24px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #6c63ff, #63b3ff)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 800, color: '#e8e8f0', letterSpacing: '-0.5px' }}>
              Ascent
            </span>
          </div>
          <p style={{ color: '#6b6b80', fontSize: '14px' }}>새 계정을 만들어보세요</p>
        </div>

        <div style={{
          background: '#1f2937',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: '36px',
        }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 700, color: '#e8e8f0', marginBottom: '28px', letterSpacing: '-0.3px' }}>
            회원가입
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: '이메일', type: 'email', value: email, setter: setEmail, placeholder: 'you@example.com' },
              { label: '닉네임', type: 'text', value: nickname, setter: setNickname, placeholder: '2~20자' },
              { label: '비밀번호', type: 'password', value: password, setter: setPassword, placeholder: '4~20자' },
            ].map(({ label, type, value, setter, placeholder }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9090a8', marginBottom: '8px', letterSpacing: '0.3px' }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="input-field"
                  placeholder={placeholder}
                  required
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: '#111827', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', color: '#e8e8f0', fontSize: '14px',
                    outline: 'none', transition: 'all 0.2s ease',
                  }}
                />
              </div>
            ))}

            {error && (
              <div style={{
                background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)',
                borderRadius: '8px', padding: '10px 14px',
                color: '#ff6b6b', fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
              style={{
                marginTop: '8px', padding: '13px',
                background: 'linear-gradient(135deg, #6c63ff, #5a54e8)',
                border: 'none', borderRadius: '10px',
                color: 'white', fontSize: '14px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
              }}
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b6b80' }}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" style={{ color: '#6c63ff', textDecoration: 'none', fontWeight: 500 }}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}