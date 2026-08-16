import React from 'react';
import { Badge, SkillTierBadge } from '../common/Badge';
import { ChevronRight } from 'lucide-react';

export function MemberCard({ member, onClick }) {
  const winRate = member.matchesPlayed > 0 
    ? Math.round((member.wins / member.matchesPlayed) * 100) 
    : 0;

  return (
    <div
      onClick={onClick}
      className="glass-card glass-card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem',
        position: 'relative'
      }}
    >
      {/* Top Header: Avatar, Name & Elo */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={member.avatar}
                alt={member.name}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.1)'
                }}
              />
              {member.streak >= 3 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    backgroundColor: '#f97316',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    boxShadow: '0 0 6px #f97316'
                  }}
                  title={`Chuỗi thắng: ${member.streak} trận`}
                >
                  🔥
                </div>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-primary)' }}>
                {member.name}
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--neon-lime)', fontWeight: '600' }}>
                "{member.nickname}"
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: '800',
                fontSize: '1.15rem',
                color: 'var(--neon-lime)'
              }}
            >
              {member.elo}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              DUPR {member.dupr.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Skill Tier & Playstyle */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
          <SkillTierBadge tier={member.tier} />
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {member.playStyle}
          </span>
        </div>
      </div>

      {/* Bottom Row: Stats & Badges */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.6rem 0.85rem',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            marginBottom: '0.75rem'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Thành tích: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{member.wins}T - {member.losses}B</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Tỉ lệ thắng: </span>
            <strong style={{ color: winRate >= 70 ? 'var(--neon-lime)' : 'var(--text-primary)' }}>
              {winRate}%
            </strong>
          </div>
        </div>

        {/* Badges Preview */}
        <div className="flex-between">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {member.badges && member.badges.length > 0 ? (
              member.badges.map(bId => <Badge key={bId} badgeId={bId} size="sm" />)
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hội viên CLB</span>
            )}
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    </div>
  );
}
