import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles } from 'lucide-react';

export function ChampionPodium({ champion, tournamentName, prizeTrophy }) {
  useEffect(() => {
    const end = Date.now() + 3.5 * 1000;
    const colors = ['#ccff00', '#06b6d4', '#fbbf24', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '2px solid rgba(245, 158, 11, 0.5)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        boxShadow: '0 0 50px rgba(245, 158, 11, 0.25)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          color: '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)'
        }}
      >
        <Trophy size={40} />
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        <Sparkles size={16} />
        <span>Vinh Danh Nhà Vô Địch Giải Đấu</span>
      </div>

      <h1 className="gradient-text-gold" style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
        {champion.name}
      </h1>

      <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Nhà Vô Địch Đỉnh Cao của <strong>{tournamentName}</strong>
      </p>

      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          color: '#fbbf24',
          fontWeight: '700',
          fontSize: '0.9rem',
          marginTop: '0.5rem'
        }}
      >
        Phần thưởng: {prizeTrophy}
      </div>
    </div>
  );
}
