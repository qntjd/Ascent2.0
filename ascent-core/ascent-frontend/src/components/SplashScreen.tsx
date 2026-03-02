import { useEffect, useState } from 'react'

interface Props {
  onFinish: () => void
}

export default function SplashScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<'enter' | 'stay' | 'exit'>('enter')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('stay'), 600)
    const t2 = setTimeout(() => setPhase('exit'), 2400)
    const t3 = setTimeout(() => onFinish(), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onFinish])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0a0e1a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: phase === 'exit' ? 0 : 1,
      transition: phase === 'exit' ? 'opacity 0.6s ease' : 'none',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        @keyframes logoEnter {
          from { opacity: 0; transform: translateY(24px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(108,99,255,0.4), 0 0 80px rgba(108,99,255,0.15); }
          50%       { box-shadow: 0 0 60px rgba(108,99,255,0.7), 0 0 120px rgba(108,99,255,0.25); }
        }
        @keyframes subtitleEnter {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes barFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes dotBlink {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40%            { transform: scale(1); opacity: 1; }
        }
        @keyframes bgGlow {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.7; }
        }
        .logo-wrap { animation: logoEnter 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
        .subtitle { animation: subtitleEnter 0.5s ease 0.9s both; }
        .loading-bar-fill { animation: barFill 2.2s cubic-bezier(0.4,0,0.2,1) 0.5s both; }
        .dot1 { animation: dotBlink 1.2s ease 0.8s infinite; }
        .dot2 { animation: dotBlink 1.2s ease 1.0s infinite; }
        .dot3 { animation: dotBlink 1.2s ease 1.2s infinite; }
        .bg-glow { animation: bgGlow 2s ease infinite; }
      `}</style>

      {/* 배경 글로우 */}
      <div className="bg-glow" style={{
        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* 로고 */}
      <div className="logo-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '22px',
          background: 'linear-gradient(135deg, #6c63ff 0%, #63b3ff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px',
          animation: 'glowPulse 2s ease infinite',
        }}>⚡</div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: '36px', fontWeight: 800,
            background: 'linear-gradient(135deg, #e8e8f0 30%, #6c63ff 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px', lineHeight: 1.1,
          }}>Ascent</div>
          <div className="subtitle" style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
            color: '#6b6b80', marginTop: '6px', letterSpacing: '0.5px',
          }}>Team Collaboration Platform</div>
        </div>
      </div>

      {/* 로딩 바 + 점 */}
      <div className="subtitle" style={{ marginTop: '52px', width: '200px' }}>
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
          <div className="loading-bar-fill" style={{
            height: '100%', borderRadius: '3px',
            background: 'linear-gradient(90deg, #6c63ff, #63b3ff)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '16px' }}>
          <div className="dot1" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6c63ff' }} />
          <div className="dot2" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6c63ff' }} />
          <div className="dot3" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6c63ff' }} />
        </div>
      </div>
    </div>
  )
}