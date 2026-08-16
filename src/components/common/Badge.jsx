import React from 'react';
import { BADGE_DEFINITIONS } from '../../data/seedData';

export function Badge({ badgeId, size = 'md' }) {
  const badge = BADGE_DEFINITIONS[badgeId];
  if (!badge) return null;

  const isSmall = size === 'sm';

  return (
    <span
      className="badge"
      title={`${badge.name}: ${badge.description}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.2rem' : '0.35rem',
        padding: isSmall ? '0.15rem 0.45rem' : '0.25rem 0.65rem',
        borderRadius: '9999px',
        fontSize: isSmall ? '0.72rem' : '0.8rem',
        fontWeight: '600',
        backgroundColor: `${badge.color}18`,
        color: badge.color,
        border: `1px solid ${badge.color}40`,
        cursor: 'help',
        transition: 'transform 0.15s ease'
      }}
    >
      <span>{badge.icon}</span>
      <span>{badge.name}</span>
    </span>
  );
}

export function SkillTierBadge({ tier }) {
  let bg = 'rgba(148, 163, 184, 0.15)';
  let color = '#94a3b8';
  let border = 'rgba(148, 163, 184, 0.3)';

  if (!tier) tier = 'Mới bắt đầu';

  if (tier.includes('Chuyên nghiệp') || tier.includes('Cao thủ') || tier.includes('Pro') || tier.includes('Advanced')) {
    bg = 'rgba(204, 255, 0, 0.12)';
    color = '#ccff00';
    border = 'rgba(204, 255, 0, 0.35)';
  } else if (tier.includes('Nâng cao') || tier.includes('Trung cấp+')) {
    bg = 'rgba(6, 182, 212, 0.12)';
    color = '#22d3ee';
    border = 'rgba(6, 182, 212, 0.35)';
  } else if (tier.includes('Tiềm năng') || tier.includes('Rising Star')) {
    bg = 'rgba(245, 158, 11, 0.12)';
    color = '#fbbf24';
    border = 'rgba(245, 158, 11, 0.35)';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '700',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        letterSpacing: '0.02em'
      }}
    >
      {tier}
    </span>
  );
}

export function MemberStatusBadge({ status = 'active', size = 'md' }) {
  const isSmall = size === 'sm';
  let label = 'Hoạt động';
  let icon = '🟢';
  let color = '#34d399';
  let bg = 'rgba(16, 185, 129, 0.15)';
  let border = 'rgba(16, 185, 129, 0.35)';

  if (status === 'paused' || status === 'Tạm nghỉ') {
    label = 'Tạm nghỉ';
    icon = '🟡';
    color = '#fbbf24';
    bg = 'rgba(245, 158, 11, 0.15)';
    border = 'rgba(245, 158, 11, 0.35)';
  } else if (status === 'left' || status === 'Rời CLB') {
    label = 'Rời CLB';
    icon = '⚪';
    color = '#94a3b8';
    bg = 'rgba(148, 163, 184, 0.15)';
    border = 'rgba(148, 163, 184, 0.35)';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.25rem' : '0.35rem',
        padding: isSmall ? '0.15rem 0.45rem' : '0.2rem 0.55rem',
        borderRadius: '9999px',
        fontSize: isSmall ? '0.7rem' : '0.75rem',
        fontWeight: '700',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        letterSpacing: '0.02em'
      }}
    >
      <span style={{ fontSize: isSmall ? '0.65rem' : '0.7rem' }}>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
