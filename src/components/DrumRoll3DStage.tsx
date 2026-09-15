import React, { useEffect, useState } from 'react';

interface DrumRoll3DStageProps {
  phase: 'approaching' | 'swooshing';
  targetRank: number; // 1, 2, 3
  countdown: number;
  initialCountdown?: number;
  onSkip?: () => void;
}

export const DrumRoll3DStage: React.FC<DrumRoll3DStageProps> = ({
  phase,
  targetRank,
  countdown,
  initialCountdown = 5,
  onSkip,
}) => {
  const [stickPhase, setStickPhase] = useState<0 | 1>(0);
  const [swayX, setSwayX] = useState<number>(0);

  // High-speed drumstick beating & lively left-right sway during approach
  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      setStickPhase((prev) => (prev === 0 ? 1 : 0));
      // Left-right rhythmic swaying: alternates left, center, right, center
      const sways = [-14, -6, 8, 16, 8, -6];
      setSwayX(sways[tick % sways.length]);
    }, 75);
    return () => clearInterval(interval);
  }, []);

  const isGrandChampion = targetRank === 1;
  const isSecondPlace = targetRank === 2;

  const rankTitle = isGrandChampion
    ? '👑 대망의 1위 대상 (Grand Champion) 👑'
    : isSecondPlace
    ? '🥈 제 2위 최우수상 발표 🥈'
    : '🥉 제 3위 우수상 발표 🥉';

  const rankSub = isGrandChampion
    ? '단 하나의 영예, 영예의 대상을 발표합니다!'
    : isSecondPlace
    ? '최고의 찬사를 받은 최우수 프로젝트는?!'
    : '첫 번째 수상팀, 우수상의 주인공은?!';

  // Dynamic 3D depth and scale based on actual countdown progress from start
  const totalSpan = Math.max(1, initialCountdown - 0.5);
  const elapsed = Math.max(0, initialCountdown - countdown);
  const progressRatio = Math.max(0, Math.min(1, elapsed / totalSpan));
  const translateZ = phase === 'approaching' ? -150 + progressRatio * 260 : -900;
  const scale = phase === 'approaching' ? 0.9 + progressRatio * 0.45 : 0.08;
  const rotateX = phase === 'approaching' ? 14 - progressRatio * 14 : 35;
  const currentSway = phase === 'approaching' ? swayX : 0;
  const rotateZ = phase === 'approaching' ? (swayX > 0 ? 2.5 : -2.5) : 0;
  const opacity = phase === 'approaching' ? 1 : 0;
  const filter = phase === 'approaching' ? 'none' : 'blur(8px)';

  return (
    <div className="relative w-full max-w-2xl mx-auto py-6 sm:py-10 flex flex-col items-center justify-center [perspective:1200px] overflow-visible">
      {/* Skip button for presenter */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="absolute top-0 right-2 py-1.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-[11px] font-bold text-slate-300 border border-slate-700 transition-all cursor-pointer flex items-center gap-1 shadow-sm hover:scale-105 z-30"
          title="대기 시간 없이 즉시 발표"
        >
          <span>즉시 확인 (Skip)</span>
          <span>⏩</span>
        </button>
      )}

      {/* 3D Animated Drum Wrapper with Dynamic Left-Right Sway */}
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: `translate3d(${currentSway}px, 0, ${translateZ}px) scale(${scale}) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
          opacity,
          filter,
          transition:
            phase === 'swooshing'
              ? 'all 0.42s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'transform 0.1s ease-out, opacity 0.3s ease-out',
        }}
        className="relative flex flex-col items-center justify-center select-none will-change-transform"
      >
        {/* Kinetic Drumroll Speech Bubble */}
        <div
          className={`mb-3 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black tracking-wider flex items-center gap-2 shadow-2xl border transition-all duration-75 ${
            isGrandChampion
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-yellow-200 shadow-amber-500/50'
              : 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/40'
          } ${stickPhase === 0 ? 'scale-105 -rotate-2' : 'scale-100 rotate-2'}`}
        >
          <span className="text-base animate-spin" style={{ animationDuration: '2s' }}>
            🥁
          </span>
          <span className="font-black text-sm uppercase">두구두구두구... 🥁</span>
        </div>

        {/* Shockwave Rings on Drum Strike */}
        <div className="relative w-48 h-36 sm:w-64 sm:h-48 flex items-center justify-center">
          <div
            className={`absolute top-5 w-36 h-18 sm:w-48 sm:h-24 rounded-[50%] border-2 transition-all duration-100 pointer-events-none ${
              isGrandChampion ? 'border-amber-400/80 shadow-lg shadow-amber-400/50' : 'border-cyan-400/80'
            } ${
              stickPhase === 0
                ? 'scale-125 opacity-80 -translate-y-2'
                : 'scale-95 opacity-20 translate-y-0'
            }`}
          />
          <div
            className={`absolute top-4 w-44 h-20 sm:w-56 sm:h-28 rounded-[50%] border transition-all duration-150 pointer-events-none ${
              isGrandChampion ? 'border-yellow-300/60' : 'border-indigo-400/60'
            } ${
              stickPhase === 1
                ? 'scale-135 opacity-70 -translate-y-3'
                : 'scale-90 opacity-15 translate-y-0'
            }`}
          />

          {/* Realistic Snare Drum SVG with Alternating Drumsticks */}
          <svg
            viewBox="0 0 160 120"
            className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] overflow-visible"
          >
            <defs>
              <linearGradient id="drum3d-shell" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isGrandChampion ? '#92400e' : '#1e1b4b'} />
                <stop offset="50%" stopColor={isGrandChampion ? '#d97706' : '#312e81'} />
                <stop offset="100%" stopColor={isGrandChampion ? '#78350f' : '#0f172a'} />
              </linearGradient>

              <linearGradient id="drum3d-gold-rim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>

              <linearGradient id="drum3d-skin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>

              <radialGradient id="drum3d-hit-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={isGrandChampion ? '#fef08a' : '#67e8f9'} stopOpacity="0.95" />
                <stop offset="100%" stopColor={isGrandChampion ? '#f59e0b' : '#3b82f6'} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Drum Shell Cylinder */}
            <path
              d="M 24 50 Q 80 68 136 50 L 136 84 Q 80 106 24 84 Z"
              fill="url(#drum3d-shell)"
              stroke={isGrandChampion ? '#fbbf24' : '#f59e0b'}
              strokeWidth="2.5"
            />

            {/* Tension Rods */}
            {[-38, -19, 0, 19, 38].map((offset, i) => {
              const x = 80 + offset;
              const topY = 56 - Math.abs(offset) * 0.15;
              const botY = 92 - Math.abs(offset) * 0.2;
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={topY}
                    x2={x}
                    y2={botY}
                    stroke={isGrandChampion ? '#fbbf24' : '#fbbf24'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx={x} cy={topY + 3} r="2.5" fill="#fef08a" />
                  <circle cx={x} cy={botY - 3} r="2.5" fill="#fef08a" />
                </g>
              );
            })}

            {/* Bottom Rim Accent */}
            <path
              d="M 24 84 Q 80 106 136 84"
              fill="none"
              stroke="url(#drum3d-gold-rim)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Top Drum Head (Skin) */}
            <ellipse
              cx="80"
              cy="46"
              rx="56"
              ry="18"
              fill="url(#drum3d-skin)"
              stroke="url(#drum3d-gold-rim)"
              strokeWidth="3.5"
            />

            {/* Head Inner Texture */}
            <ellipse
              cx="80"
              cy="46"
              rx="46"
              ry="14"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="0.8"
              strokeDasharray="4,3"
              opacity="0.6"
            />

            {/* Dynamic Hit Flash */}
            {stickPhase === 0 ? (
              <circle cx="62" cy="46" r="16" fill="url(#drum3d-hit-glow)" />
            ) : (
              <circle cx="98" cy="46" r="16" fill="url(#drum3d-hit-glow)" />
            )}

            {/* Left Drumstick (Alternating Strike) */}
            <g
              transform={
                stickPhase === 0
                  ? 'rotate(-6, 62, 46) translate(0, 4)'
                  : 'rotate(-34, 62, 46) translate(-2, -8)'
              }
              className="transition-transform duration-75"
            >
              <line
                x1="20"
                y1="10"
                x2="62"
                y2="46"
                stroke="#d97706"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <line
                x1="22"
                y1="11"
                x2="60"
                y2="45"
                stroke="#fef3c7"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <ellipse cx="62" cy="46" rx="4" ry="5" fill="#b45309" stroke="#fef3c7" strokeWidth="1" />
            </g>

            {/* Right Drumstick (Alternating Strike) */}
            <g
              transform={
                stickPhase === 1
                  ? 'rotate(6, 98, 46) translate(0, 4)'
                  : 'rotate(34, 98, 46) translate(2, -8)'
              }
              className="transition-transform duration-75"
            >
              <line
                x1="140"
                y1="10"
                x2="98"
                y2="46"
                stroke="#d97706"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <line
                x1="138"
                y1="11"
                x2="100"
                y2="45"
                stroke="#fef3c7"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <ellipse cx="98" cy="46" rx="4" ry="5" fill="#b45309" stroke="#fef3c7" strokeWidth="1" />
            </g>
          </svg>
        </div>

        {/* Dynamic Countdown Circle */}
        <div className="mt-3 flex flex-col items-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-amber-400/40 animate-ping opacity-30" />
            <div className="absolute inset-0 rounded-full bg-slate-950/90 border-4 border-amber-400 shadow-xl shadow-amber-500/50 flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-black text-amber-300">
                {countdown > 0 ? countdown : '✨'}
              </span>
              <span className="text-[9px] font-bold text-amber-400 uppercase -mt-0.5">SEC</span>
            </div>
          </div>
        </div>

        {/* Announcement Text Under Drum */}
        <div className="mt-4 text-center">
          <h3 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300">
            {rankTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 animate-pulse">
            {rankSub}
          </p>
        </div>
      </div>
    </div>
  );
};
