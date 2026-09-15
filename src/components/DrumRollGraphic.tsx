import React, { useEffect, useState } from 'react';

interface DrumRollGraphicProps {
  side?: 'left' | 'right' | 'center';
  isGrandChampion?: boolean;
  accentColor?: string;
  label?: string;
}

export const DrumRollGraphic: React.FC<DrumRollGraphicProps> = ({
  side = 'center',
  isGrandChampion = false,
  label = '두구두구두구... 🥁',
}) => {
  // Alternating drum hit state for high-energy drumstick action
  const [stickPhase, setStickPhase] = useState<0 | 1>(0);

  useEffect(() => {
    // Rapid alternating beat (~75ms per hit = intense realistic drum roll tempo)
    const interval = setInterval(() => {
      setStickPhase((prev) => (prev === 0 ? 1 : 0));
    }, 75);
    return () => clearInterval(interval);
  }, []);

  const shellGradientId = `drum-shell-${side}-${isGrandChampion ? 'gold' : 'amber'}`;
  const rimColor = isGrandChampion ? '#fbbf24' : '#f59e0b';
  const shellColor1 = isGrandChampion ? '#b45309' : '#1e1b4b';
  const shellColor2 = isGrandChampion ? '#78350f' : '#0f172a';

  return (
    <div className="flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Action Sound Bubble */}
      <div
        className={`mb-2 px-3 py-1 rounded-full text-xs font-black tracking-wider flex items-center gap-1.5 shadow-lg border transition-all duration-75 ${
          isGrandChampion
            ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border-yellow-200 shadow-amber-500/40'
            : 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/30'
        } ${stickPhase === 0 ? 'scale-105 -rotate-2' : 'scale-100 rotate-2'}`}
      >
        <span className="inline-block animate-spin" style={{ animationDuration: '3s' }}>
          🥁
        </span>
        <span>{label}</span>
      </div>

      {/* Drum SVG Container */}
      <div className="relative w-36 h-28 sm:w-44 sm:h-34 flex items-center justify-center">
        {/* Animated Shockwave Ripples from Drum Skin */}
        <div
          className={`absolute top-4 w-24 h-12 rounded-[50%] border-2 transition-all duration-150 pointer-events-none ${
            isGrandChampion ? 'border-amber-400/80' : 'border-cyan-400/80'
          } ${
            stickPhase === 0
              ? 'scale-125 opacity-70 -translate-y-1'
              : 'scale-90 opacity-20 translate-y-0'
          }`}
        />
        <div
          className={`absolute top-3 w-28 h-14 rounded-[50%] border transition-all duration-200 pointer-events-none ${
            isGrandChampion ? 'border-yellow-300/60' : 'border-indigo-400/60'
          } ${
            stickPhase === 1
              ? 'scale-135 opacity-60 -translate-y-2'
              : 'scale-95 opacity-10 translate-y-0'
          }`}
        />

        <svg
          viewBox="0 0 160 120"
          className="w-full h-full drop-shadow-2xl overflow-visible"
        >
          <defs>
            <linearGradient id={shellGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={shellColor1} />
              <stop offset="50%" stopColor={isGrandChampion ? '#d97706' : '#312e81'} />
              <stop offset="100%" stopColor={shellColor2} />
            </linearGradient>

            <linearGradient id={`gold-rim-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            <linearGradient id={`drum-skin-${side}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            <radialGradient id={`hit-glow-${side}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isGrandChampion ? '#fef08a' : '#67e8f9'} stopOpacity="0.9" />
              <stop offset="100%" stopColor={isGrandChampion ? '#f59e0b' : '#3b82f6'} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Drum Shell (Body Cylinder) */}
          <path
            d="M 24 50 Q 80 68 136 50 L 136 84 Q 80 106 24 84 Z"
            fill={`url(#${shellGradientId})`}
            stroke={rimColor}
            strokeWidth="2"
          />

          {/* Tension Rods / Metallic Tuning Lugs */}
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
                  stroke={rimColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.9"
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
            stroke={`url(#gold-rim-${side})`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Drum Head (Top Resonant Skin) */}
          <ellipse
            cx="80"
            cy="46"
            rx="56"
            ry="18"
            fill={`url(#drum-skin-${side})`}
            stroke={`url(#gold-rim-${side})`}
            strokeWidth="3.5"
          />

          {/* Drum Skin Inner Texture Ring */}
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

          {/* Impact Strike Flash Glow on Left vs Right Hit */}
          {stickPhase === 0 ? (
            <circle cx="62" cy="46" r="14" fill={`url(#hit-glow-${side})`} />
          ) : (
            <circle cx="98" cy="46" r="14" fill={`url(#hit-glow-${side})`} />
          )}

          {/* Left Drumstick */}
          {/* Pivots down to hit when stickPhase === 0 */}
          <g
            transform={
              stickPhase === 0
                ? 'rotate(-8, 62, 46) translate(0, 4)'
                : 'rotate(-32, 62, 46) translate(-2, -8)'
            }
            className="transition-transform duration-75"
          >
            {/* Stick Shaft */}
            <line
              x1="22"
              y1="12"
              x2="62"
              y2="46"
              stroke="#d97706"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="24"
              y1="13"
              x2="60"
              y2="45"
              stroke="#fef3c7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Stick Wooden Tip */}
            <ellipse cx="62" cy="46" rx="3.5" ry="4.5" fill="#b45309" stroke="#fef3c7" strokeWidth="1" />
          </g>

          {/* Right Drumstick */}
          {/* Pivots down to hit when stickPhase === 1 */}
          <g
            transform={
              stickPhase === 1
                ? 'rotate(8, 98, 46) translate(0, 4)'
                : 'rotate(32, 98, 46) translate(2, -8)'
            }
            className="transition-transform duration-75"
          >
            {/* Stick Shaft */}
            <line
              x1="138"
              y1="12"
              x2="98"
              y2="46"
              stroke="#d97706"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="136"
              y1="13"
              x2="100"
              y2="45"
              stroke="#fef3c7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Stick Wooden Tip */}
            <ellipse cx="98" cy="46" rx="3.5" ry="4.5" fill="#b45309" stroke="#fef3c7" strokeWidth="1" />
          </g>
        </svg>
      </div>

      {/* Dynamic Sound Equalizer Visualizer Bars */}
      <div className="flex items-end gap-1 h-5 mt-1">
        {[0.8, 0.4, 1.0, 0.6, 0.9, 0.5, 0.85].map((factor, idx) => {
          const height =
            stickPhase === (idx % 2)
              ? Math.max(6, Math.round(20 * factor))
              : Math.max(4, Math.round(10 * factor));
          return (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-75 ${
                isGrandChampion ? 'bg-amber-400 shadow-xs shadow-amber-400' : 'bg-cyan-400'
              }`}
              style={{ height: `${height}px` }}
            />
          );
        })}
      </div>
    </div>
  );
};
