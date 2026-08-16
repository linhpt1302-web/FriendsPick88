import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'lime' }) {
  const isLime = color === 'lime';
  const isCyan = color === 'cyan';
  const isGold = color === 'gold';

  let borderColor = 'var(--border-subtle)';
  let glowStyle = {};

  if (isLime) {
    borderColor = 'var(--border-lime)';
    glowStyle = { background: 'var(--neon-lime-soft)', color: 'var(--neon-lime)' };
  } else if (isCyan) {
    borderColor = 'var(--border-cyan)';
    glowStyle = { background: 'var(--neon-cyan-soft)', color: 'var(--neon-cyan)' };
  } else if (isGold) {
    borderColor = 'rgba(245, 158, 11, 0.35)';
    glowStyle = { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' };
  }

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
            {title}
          </span>
          <h2
            style={{
              fontSize: '2.1rem',
              fontWeight: '800',
              marginTop: '0.35rem',
              letterSpacing: '-0.03em'
            }}
          >
            {value}
          </h2>
        </div>
        {Icon && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...glowStyle
            }}
          >
            <Icon size={24} />
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.825rem'
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>{subtitle}</span>
        {trend && (
          <div className={trend > 0 ? 'stat-trend-up' : 'stat-trend-down'}>
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trend > 0 ? `+${trend}%` : `${trend}%`}</span>
          </div>
        )}
      </div>
    </div>
  );
}
