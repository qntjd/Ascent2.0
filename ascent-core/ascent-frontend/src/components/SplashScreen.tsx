import { useEffect, useState } from 'react'

interface Props {
  onFinish: () => void
}

export default function SplashScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<'strike' | 'text' | 'exit'>('strike')
  const [flashCount, setFlashCount] = useState(0)

  useEffect(() => {
    // 번개 번쩍임 반복
    const flashes = [100, 250, 400, 600, 750, 950]
    const timers = flashes.map((delay, i) =>
      setTimeout(() => setFlashCount(i + 1), delay)
    )
    const t1 = setTimeout(() => setPhase('text'), 1100)
    const t2 = setTimeout(() => setPhase('exit'), 2600)
    const t3 = setTimeout(() => onFinish(), 3200)
    return () => { timers.forEach(clearTimeout); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onFinish])

  const isFlashing = flashCount % 2 === 1 && phase === 'strike'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: isFlashing ? '#1a1060' : '#0a0e1a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: phase === 'exit' ? 0 : 1,
      transition: phase === 'exit' ? 'opacity 0.6s ease' : 'background 0.05s ease',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

        @keyframes boltFlicker {
          0%   { opacity: 0; }
          10%  { opacity: 1; }
          15%  { opacity: 0.4; }
          20%  { opacity: 1; }
          25%  { opacity: 0.6; }
          30%  { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes boltGlow {
          0%, 100% { filter: drop-shadow(0 0 10px #a78bfa) drop-shadow(0 0 30px #6c63ff) drop-shadow(0 0 60px #4f46e5); }
          50%       { filter: drop-shadow(0 0 20px #c4b5fd) drop-shadow(0 0 60px #a78bfa) drop-shadow(0 0 100px #6c63ff); }
        }
        @keyframes branchFlicker {
          0%,100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
        @keyframes textAppear {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes subAppear {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes barFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes bgGlow {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 0.9; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .bolt-main { animation: boltFlicker 0.15s ease forwards, boltGlow 1s ease 0.3s infinite; }
        .bolt-branch { animation: branchFlicker 0.2s ease infinite; }
        .text-title { animation: textAppear 0.6s cubic-bezier(0.34,1.3,0.64,1) forwards; }
        .text-sub { animation: subAppear 0.5s ease 0.2s both; }
        .bg-glow { animation: bgGlow 1.5s ease infinite; }
        .bar-fill { animation: barFill 1.8s cubic-bezier(0.4,0,0.2,1) 0.3s both; }
        .shimmer-text {
          background: linear-gradient(90deg, #e8e8f0 0%, #ffffff 40%, #a78bfa 50%, #6c63ff 60%, #e8e8f0 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s linear infinite;
        }
      `}</style>

      {/* 배경 방사형 글로우 */}
      {phase === 'strike' && (
        <div className="bg-glow" style={{
          position: 'absolute', inset: 0,
          background: isFlashing
            ? 'radial-gradient(ellipse at 50% 0%, rgba(140,120,255,0.5) 0%, rgba(80,60,200,0.2) 40%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.2) 0%, transparent 60%)',
          pointerEvents: 'none',
          transition: 'background 0.05s',
        }} />
      )}

      {/* 번개 SVG - 화면 전체 */}
      {phase === 'strike' && (
        <svg
          viewBox="0 0 400 700"
          style={{
            position: 'absolute', top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '100%', maxWidth: '500px', height: '100%',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient id="mainBolt" x1="0" y1="0" x2="0.3" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#c4b5fd" />
              <stop offset="70%" stopColor="#6c63ff" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="branch1" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6c63ff" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="branch2" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="strongGlow">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* 메인 번개 줄기 */}
          <path
            className="bolt-main"
            d="M 210 0 L 225 80 L 245 78 L 195 200 L 215 198 L 160 350 L 185 345 L 140 500 L 165 495 L 120 700"
            stroke="url(#mainBolt)" strokeWidth="3.5" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
            filter="url(#strongGlow)"
          />
          {/* 메인 번개 코어 (밝은 흰색 중심) */}
          <path
            className="bolt-main"
            d="M 210 0 L 225 80 L 245 78 L 195 200 L 215 198 L 160 350 L 185 345 L 140 500 L 165 495 L 120 700"
            stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
          />

          {/* 가지 1 - 왼쪽 위 */}
          <path
            className="bolt-branch"
            d="M 230 85 L 170 160 L 145 155 L 110 220"
            stroke="url(#branch1)" strokeWidth="2" fill="none"
            strokeLinecap="round" filter="url(#glow)"
          />
          <path className="bolt-branch" d="M 230 85 L 170 160 L 145 155 L 110 220" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" fill="none" strokeLinecap="round" />

          {/* 가지 2 - 오른쪽 중간 */}
          <path
            className="bolt-branch"
            d="M 200 200 L 270 260 L 295 255 L 330 310"
            stroke="url(#branch2)" strokeWidth="1.8" fill="none"
            strokeLinecap="round" filter="url(#glow)"
          />
          <path className="bolt-branch" d="M 200 200 L 270 260 L 295 255 L 330 310" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7" fill="none" strokeLinecap="round" />

          {/* 가지 3 - 왼쪽 중간 */}
          <path
            className="bolt-branch"
            d="M 165 348 L 100 400 L 75 395 L 50 450"
            stroke="url(#branch1)" strokeWidth="1.5" fill="none"
            strokeLinecap="round" filter="url(#glow)"
          />
          <path className="bolt-branch" d="M 165 348 L 100 400 L 75 395 L 50 450" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" fill="none" strokeLinecap="round" />

          {/* 가지 4 - 오른쪽 아래 */}
          <path
            className="bolt-branch"
            d="M 150 498 L 220 540 L 250 535 L 290 590"
            stroke="url(#branch2)" strokeWidth="1.3" fill="none"
            strokeLinecap="round" filter="url(#glow)"
          />

          {/* 작은 잔가지들 */}
          <path className="bolt-branch" d="M 195 200 L 155 230 L 135 225" stroke="#a78bfa" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
          <path className="bolt-branch" d="M 160 350 L 200 380 L 215 375" stroke="#a78bfa" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
          <path className="bolt-branch" d="M 225 80 L 260 110 L 280 105" stroke="#c4b5fd" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.5" />
        </svg>
      )}

      {/* 텍스트 단계 */}
      {phase === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="text-title" style={{ textAlign: 'center' }}>
            <div className="shimmer-text" style={{
              fontFamily: "'Syne', sans-serif", fontSize: '52px', fontWeight: 800,
              letterSpacing: '-2px', lineHeight: 1,
            }}>Ascent</div>
            <div className="text-sub" style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
              color: '#6b6b80', marginTop: '10px', letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>Team Collaboration Platform</div>
          </div>

          <div style={{ marginTop: '32px', width: '200px' }}>
            <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <div className="bar-fill" style={{
                height: '100%', borderRadius: '2px',
                background: 'linear-gradient(90deg, #6c63ff, #a78bfa, #63b3ff)',
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}