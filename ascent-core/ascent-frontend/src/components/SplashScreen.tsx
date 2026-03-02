import { useEffect, useState } from 'react'

interface Props {
  onFinish: () => void
}

export default function SplashScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<'idle' | 'strike' | 'logo' | 'text' | 'exit'>('idle')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('strike'), 300)   // 번개 치기
    const t2 = setTimeout(() => setPhase('logo'), 700)     // 로고 등장
    const t3 = setTimeout(() => setPhase('text'), 1100)    // 텍스트 등장
    const t4 = setTimeout(() => setPhase('exit'), 2500)    // 페이드아웃 시작
    const t5 = setTimeout(() => onFinish(), 3100)          // 완전히 사라짐
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [onFinish])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0a0e1a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: phase === 'exit' ? 0 : 1,
      transition: phase === 'exit' ? 'opacity 0.6s ease' : 'none',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

        /* 번개 플래시 */
        @keyframes flashBg {
          0%   { opacity: 0; }
          10%  { opacity: 1; }
          20%  { opacity: 0.3; }
          30%  { opacity: 0.9; }
          50%  { opacity: 0; }
          100% { opacity: 0; }
        }

        /* 번개 볼트 드로우 */
        @keyframes boltDraw {
          from { stroke-dashoffset: 300; opacity: 0; }
          to   { stroke-dashoffset: 0; opacity: 1; }
        }

        /* 번개 글로우 */
        @keyframes boltGlow {
          0%   { filter: drop-shadow(0 0 8px #6c63ff) drop-shadow(0 0 20px #6c63ff); }
          50%  { filter: drop-shadow(0 0 20px #a78bfa) drop-shadow(0 0 50px #6c63ff) drop-shadow(0 0 80px #4f46e5); }
          100% { filter: drop-shadow(0 0 12px #6c63ff) drop-shadow(0 0 30px #6c63ff); }
        }

        /* 로고 박스 등장 */
        @keyframes logoAppear {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* 텍스트 등장 */
        @keyframes textSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* 파티클 퍼짐 */
        @keyframes particle1 { from { transform: translate(0,0); opacity:1; } to { transform: translate(-60px,-80px); opacity:0; } }
        @keyframes particle2 { from { transform: translate(0,0); opacity:1; } to { transform: translate(60px,-80px); opacity:0; } }
        @keyframes particle3 { from { transform: translate(0,0); opacity:1; } to { transform: translate(-80px,20px); opacity:0; } }
        @keyframes particle4 { from { transform: translate(0,0); opacity:1; } to { transform: translate(80px,20px); opacity:0; } }
        @keyframes particle5 { from { transform: translate(0,0); opacity:1; } to { transform: translate(-30px,80px); opacity:0; } }
        @keyframes particle6 { from { transform: translate(0,0); opacity:1; } to { transform: translate(30px,80px); opacity:0; } }

        /* 배경 글로우 */
        @keyframes bgGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.1); }
        }

        /* 로딩 바 */
        @keyframes barFill {
          from { width: 0%; }
          to   { width: 100%; }
        }

        .flash-overlay {
          animation: flashBg 0.5s ease forwards;
        }
        .bolt-path {
          stroke-dasharray: 300;
          animation: boltDraw 0.35s ease forwards, boltGlow 1.5s ease 0.35s infinite;
        }
        .logo-box {
          animation: logoAppear 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .text-title {
          animation: textSlideUp 0.5s ease forwards;
        }
        .text-sub {
          animation: textSlideUp 0.5s ease 0.15s forwards;
          opacity: 0;
        }
        .p1 { animation: particle1 0.6s ease 0.05s forwards; }
        .p2 { animation: particle2 0.6s ease 0.05s forwards; }
        .p3 { animation: particle3 0.6s ease 0.1s forwards; }
        .p4 { animation: particle4 0.6s ease 0.1s forwards; }
        .p5 { animation: particle5 0.6s ease 0.15s forwards; }
        .p6 { animation: particle6 0.6s ease 0.15s forwards; }
        .bg-glow { animation: bgGlow 2.5s ease infinite; }
        .loading-bar-fill { animation: barFill 2s cubic-bezier(0.4,0,0.2,1) 0.8s both; }
      `}</style>

      {/* 배경 글로우 */}
      <div className="bg-glow" style={{
        position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* 번개 플래시 오버레이 */}
      {phase === 'strike' && (
        <div className="flash-overlay" style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* 번개 SVG (strike 페이즈부터 계속 표시) */}
      {(phase === 'strike' || phase === 'logo' || phase === 'text') && (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* 번개 볼트 SVG */}
          <svg width="90" height="120" viewBox="0 0 90 120" fill="none" style={{ marginBottom: '-10px' }}>
            <path
              className="bolt-path"
              d="M55 5 L20 55 L42 55 L30 115 L75 50 L50 50 Z"
              fill="url(#boltGrad)"
              stroke="url(#strokeGrad)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="boltGrad" x1="30" y1="0" x2="60" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="50%" stopColor="#6c63ff" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="strokeGrad" x1="30" y1="0" x2="60" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c4b5fd" />
                <stop offset="100%" stopColor="#6c63ff" />
              </linearGradient>
            </defs>
          </svg>

          {/* 파티클 */}
          {phase === 'strike' && (
            <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
              {[
                { cls: 'p1', color: '#a78bfa' }, { cls: 'p2', color: '#6c63ff' },
                { cls: 'p3', color: '#63b3ff' }, { cls: 'p4', color: '#a78bfa' },
                { cls: 'p5', color: '#6c63ff' }, { cls: 'p6', color: '#63b3ff' },
              ].map(({ cls, color }) => (
                <div key={cls} className={cls} style={{
                  position: 'absolute', width: '4px', height: '4px', borderRadius: '50%',
                  background: color, boxShadow: `0 0 6px ${color}`,
                }} />
              ))}
            </div>
          )}

          {/* 로고 박스 + 텍스트 */}
          {(phase === 'logo' || phase === 'text') && (
            <div className="logo-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '20px',
                background: 'linear-gradient(135deg, #6c63ff 0%, #63b3ff 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(108,99,255,0.5), 0 0 60px rgba(108,99,255,0.2)',
              }}>
                <svg width="36" height="48" viewBox="0 0 90 120" fill="none">
                  <path d="M55 5 L20 55 L42 55 L30 115 L75 50 L50 50 Z" fill="white" />
                </svg>
              </div>

              {phase === 'text' && (
                <div style={{ textAlign: 'center' }}>
                  <div className="text-title" style={{
                    fontFamily: "'Syne', sans-serif", fontSize: '38px', fontWeight: 800,
                    background: 'linear-gradient(135deg, #e8e8f0 20%, #a78bfa 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    letterSpacing: '-1px', lineHeight: 1.1,
                  }}>Ascent</div>
                  <div className="text-sub" style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                    color: '#6b6b80', marginTop: '6px', letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}>Team Collaboration Platform</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 로딩 바 */}
      {(phase === 'text') && (
        <div style={{ marginTop: '48px', width: '180px' }}>
          <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div className="loading-bar-fill" style={{
              height: '100%', borderRadius: '2px',
              background: 'linear-gradient(90deg, #6c63ff, #63b3ff)',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}