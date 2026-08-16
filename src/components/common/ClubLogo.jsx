import React from 'react';

export function ClubLogo({ size = 'md', showText = true }) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const iconSize = isSmall ? 36 : isLarge ? 56 : 44;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', userSelect: 'none' }}>
      {/* Custom Vector Emblem */}
      <div
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Shield Glow & Border */}
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ccff00" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="paddleGradA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="paddleGradB" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="ballGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#ccff00" />
              <stop offset="100%" stopColor="#a3e635" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Hexagonal Shield Background */}
          <polygon
            points="50,4 92,24 92,72 50,96 8,72 8,24"
            fill="#0b0f19"
            stroke="url(#shieldGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
            filter="url(#neonGlow)"
          />

          {/* Left Paddle (Angled) */}
          <g transform="rotate(-28 50 50)">
            {/* Paddle Face */}
            <rect
              x="36"
              y="16"
              width="28"
              height="36"
              rx="9"
              fill="url(#paddleGradA)"
              stroke="#ccff00"
              strokeWidth="2"
            />
            {/* Paddle Handle */}
            <rect x="46" y="52" width="8" height="22" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
            <line x1="46" y1="58" x2="54" y2="58" stroke="#ccff00" strokeWidth="1" />
            <line x1="46" y1="64" x2="54" y2="64" stroke="#ccff00" strokeWidth="1" />
          </g>

          {/* Right Paddle (Angled) */}
          <g transform="rotate(28 50 50)">
            {/* Paddle Face */}
            <rect
              x="36"
              y="16"
              width="28"
              height="36"
              rx="9"
              fill="url(#paddleGradB)"
              stroke="#06b6d4"
              strokeWidth="2"
            />
            {/* Paddle Handle */}
            <rect x="46" y="52" width="8" height="22" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
            <line x1="46" y1="58" x2="54" y2="58" stroke="#06b6d4" strokeWidth="1" />
            <line x1="46" y1="64" x2="54" y2="64" stroke="#06b6d4" strokeWidth="1" />
          </g>

          {/* Center Glowing Pickleball with Holes */}
          <circle
            cx="50"
            cy="44"
            r="15"
            fill="url(#ballGrad)"
            stroke="#ffffff"
            strokeWidth="1.8"
            filter="drop-shadow(0 0 8px rgba(204, 255, 0, 0.8))"
          />
          {/* Aerodynamic Holes */}
          <circle cx="50" cy="44" r="2.2" fill="#0b0f19" opacity="0.85" />
          <circle cx="44" cy="38" r="1.8" fill="#0b0f19" opacity="0.85" />
          <circle cx="56" cy="38" r="1.8" fill="#0b0f19" opacity="0.85" />
          <circle cx="43" cy="48" r="1.8" fill="#0b0f19" opacity="0.85" />
          <circle cx="57" cy="48" r="1.8" fill="#0b0f19" opacity="0.85" />
          <circle cx="50" cy="34" r="1.5" fill="#0b0f19" opacity="0.85" />
          <circle cx="50" cy="54" r="1.5" fill="#0b0f19" opacity="0.85" />

          {/* Small Star / Emblem Accent at Bottom */}
          <polygon
            points="50,82 52,86 57,86 53,89 55,93 50,90 45,93 47,89 43,86 48,86"
            fill="#ccff00"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: '900',
                fontSize: isSmall ? '1.1rem' : isLarge ? '1.75rem' : '1.35rem',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 40%, var(--neon-lime) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              FRIENDS
            </span>
            <span
              style={{
                fontSize: isSmall ? '0.65rem' : '0.72rem',
                fontWeight: '800',
                backgroundColor: 'var(--neon-lime)',
                color: '#070a11',
                padding: '0.12rem 0.45rem',
                borderRadius: '4px',
                letterSpacing: '0.06em'
              }}
            >
              CLUB
            </span>
          </div>
          <span
            style={{
              fontSize: isSmall ? '0.68rem' : '0.76rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontWeight: '600',
              marginTop: '-2px'
            }}
          >
            Pickleball Club
          </span>
        </div>
      )}
    </div>
  );
}
