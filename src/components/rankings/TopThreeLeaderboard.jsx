import React from 'react';
import { useClub } from '../../context/ClubContext';
import { SkillTierBadge } from '../common/Badge';
import { Crown, Medal, Flame, Trophy, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';

export function TopThreeLeaderboard({ title = "Bảng Vinh Danh Top 3 Elo CLB Friends", showTitle = true }) {
  const { members, setSelectedPlayer } = useClub();

  // Sort members by Elo descending
  const sortedMembers = [...members].sort((a, b) => b.elo - a.elo);
  const top1 = sortedMembers[0];
  const top2 = sortedMembers[1];
  const top3 = sortedMembers[2];

  if (!top1 || !top2 || !top3) return null;

  // Podium order: Top 2 (Left), Top 1 (Center - Elevated), Top 3 (Right)
  const podiumList = [
    {
      player: top2,
      rank: 2,
      label: 'Á Quân',
      medalIcon: '🥈',
      color: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
      borderGlow: 'rgba(6, 182, 212, 0.4)',
      pedestalHeight: '160px',
      order: 1
    },
    {
      player: top1,
      rank: 1,
      label: 'Quán Quân Elo',
      medalIcon: '👑',
      color: '#fbbf24',
      bgGlow: 'rgba(245, 158, 11, 0.2)',
      borderGlow: 'rgba(251, 191, 36, 0.6)',
      pedestalHeight: '200px',
      order: 2
    },
    {
      player: top3,
      rank: 3,
      label: 'Quý Quân',
      medalIcon: '🥉',
      color: '#f97316',
      bgGlow: 'rgba(249, 115, 22, 0.15)',
      borderGlow: 'rgba(249, 115, 22, 0.4)',
      pedestalHeight: '130px',
      order: 3
    }
  ];

  return (
    <div
      className="glass-card"
      style={{
        padding: '2rem 1.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(11, 15, 25, 0.95) 100%)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        boxShadow: '0 0 35px rgba(245, 158, 11, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Neon Accent Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          height: '180px',
          background: 'radial-gradient(ellipse, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {showTitle && (
        <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Sparkles size={18} style={{ color: '#fbbf24' }} />
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#fbbf24'
              }}
            >
              BẢNG PHONG THẦN CLB FRIENDS
            </span>
            <Sparkles size={18} style={{ color: '#fbbf24' }} />
          </div>
          <h2
            style={{
              fontSize: '1.65rem',
              margin: '0 0 0.4rem 0',
              fontFamily: 'var(--font-display)',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 60%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {title}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Tôn vinh 3 tay vợt xuất sắc nhất sở hữu điểm xếp hạng Elo và phong độ thi đấu đỉnh cao
          </p>
        </div>
      )}

      {/* Podium Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          alignItems: 'flex-end',
          maxWidth: '960px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}
      >
        {podiumList.map(({ player, rank, label, medalIcon, color, bgGlow, borderGlow }) => {
          const isTop1 = rank === 1;
          const winRate = player.matchesPlayed > 0 
            ? Math.round((player.wins / player.matchesPlayed) * 100) 
            : 0;

          return (
            <div
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease'
              }}
              className="glass-card-interactive"
            >
              {/* Crown / Rank Medal Badge Header */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: isTop1 ? '0.35rem 0.85rem' : '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: bgGlow,
                  border: `1px solid ${borderGlow}`,
                  color: color,
                  fontSize: isTop1 ? '0.85rem' : '0.78rem',
                  fontWeight: '800',
                  marginBottom: '0.75rem',
                  boxShadow: isTop1 ? `0 0 20px ${bgGlow}` : 'none'
                }}
              >
                <span>{medalIcon}</span>
                <span>{label}</span>
              </div>

              {/* Avatar with Glow Ring */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: '1rem'
                }}
              >
                <img
                  src={player.avatar}
                  alt={player.name}
                  style={{
                    width: isTop1 ? '96px' : '76px',
                    height: isTop1 ? '96px' : '76px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `3px solid ${color}`,
                    boxShadow: `0 0 25px ${bgGlow}`,
                    padding: '2px',
                    backgroundColor: 'var(--bg-app)'
                  }}
                />

                {/* Rank Number Badge Floating on Avatar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: isTop1 ? '32px' : '26px',
                    height: isTop1 ? '32px' : '26px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    color: '#070a11',
                    fontWeight: '900',
                    fontSize: isTop1 ? '0.95rem' : '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  #{rank}
                </div>
              </div>

              {/* Player Information Card Base */}
              <div
                style={{
                  width: '100%',
                  background: isTop1 
                    ? 'linear-gradient(180deg, rgba(251, 191, 36, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)'
                    : 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  border: `1px solid ${borderGlow}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: isTop1 ? '1.5rem 1rem' : '1.25rem 0.85rem',
                  boxShadow: isTop1 ? `0 0 30px rgba(251, 191, 36, 0.15)` : 'var(--shadow-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}
              >
                <div>
                  <strong
                    style={{
                      fontSize: isTop1 ? '1.15rem' : '1rem',
                      display: 'block',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)'
                    }}
                  >
                    {player.name}
                  </strong>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: color,
                      fontWeight: '700',
                      display: 'block',
                      marginTop: '0.15rem'
                    }}
                  >
                    "{player.nickname}"
                  </span>
                </div>

                {/* Elo & DUPR Callout */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Điểm Elo
                    </span>
                    <strong
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: isTop1 ? '1.25rem' : '1.1rem',
                        color: 'var(--neon-lime)'
                      }}
                    >
                      {player.elo}
                    </strong>
                  </div>

                  <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)' }} />

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      DUPR
                    </span>
                    <strong
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: isTop1 ? '1.15rem' : '1rem',
                        color: 'var(--neon-cyan)'
                      }}
                    >
                      {player.dupr.toFixed(2)}
                    </strong>
                  </div>
                </div>

                {/* Match Stats Line */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    padding: '0 0.25rem'
                  }}
                >
                  <span>
                    Thành tích: <strong style={{ color: '#34d399' }}>{player.wins}T</strong> - <strong style={{ color: '#f87171' }}>{player.losses}B</strong>
                  </span>
                  <span>
                    Thắng: <strong style={{ color: 'var(--neon-lime)' }}>{winRate}%</strong>
                  </span>
                </div>

                {/* Streak Badge */}
                {player.streak >= 3 && (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: '#fbbf24',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Flame size={12} />
                    <span>Chuỗi thắng {player.streak} trận liên tiếp!</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
