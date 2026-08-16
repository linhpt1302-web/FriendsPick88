import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { useClub } from '../../context/ClubContext';
import { getExpectedScore } from '../../utils/eloCalculator';

export function HeadToHeadModal({ isOpen, onClose }) {
  const { members, matches } = useClub();
  const [playerAId, setPlayerAId] = useState('p-1');
  const [playerBId, setPlayerBId] = useState('p-3');

  const pA = members.find(m => m.id === playerAId) || members[0];
  const pB = members.find(m => m.id === playerBId) || members[1];

  const h2hMatches = useMemo(() => {
    return matches.filter(m => {
      const inTeamA1 = m.teamA.player1Id === pA.id || m.teamA.player2Id === pA.id;
      const inTeamB1 = m.teamB.player1Id === pA.id || m.teamB.player2Id === pA.id;

      const inTeamA2 = m.teamA.player1Id === pB.id || m.teamA.player2Id === pB.id;
      const inTeamB2 = m.teamB.player1Id === pB.id || m.teamB.player2Id === pB.id;

      return (inTeamA1 && inTeamB2) || (inTeamB1 && inTeamA2);
    });
  }, [matches, pA, pB]);

  let winsA = 0;
  let winsB = 0;

  h2hMatches.forEach(m => {
    const pAinTeamA = m.teamA.player1Id === pA.id || m.teamA.player2Id === pA.id;
    const teamAWon = m.winnerTeam === 'A' || m.scoreA > m.scoreB;

    if (pAinTeamA) {
      if (teamAWon) winsA++; else winsB++;
    } else {
      if (!teamAWon) winsA++; else winsB++;
    }
  });

  const winProbabilityA = Math.round(getExpectedScore(pA.elo, pB.elo) * 100);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="So Sánh Đối Đầu Trực Tiếp (Head-to-Head)" size="lg">
      <div>
        {/* Selector Header */}
        <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="form-label" style={{ color: 'var(--neon-lime)' }}>Người Chơi A</label>
            <select
              className="form-select"
              value={playerAId}
              onChange={(e) => setPlayerAId(e.target.value)}
            >
              {members.map(m => (
                <option key={m.id} value={m.id} disabled={m.id === playerBId}>
                  {m.name} ({m.nickname}) - {m.elo} Elo
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ color: 'var(--neon-cyan)' }}>Người Chơi B</label>
            <select
              className="form-select"
              value={playerBId}
              onChange={(e) => setPlayerBId(e.target.value)}
            >
              {members.map(m => (
                <option key={m.id} value={m.id} disabled={m.id === playerAId}>
                  {m.name} ({m.nickname}) - {m.elo} Elo
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Head to Head Duel Visual */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            border: '1px solid var(--border-medium)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            position: 'relative'
          }}
        >
          {/* Player A Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <img
              src={pA.avatar}
              alt={pA.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                border: '2px solid var(--neon-lime)'
              }}
            />
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{pA.name}</h3>
              <span style={{ color: 'var(--neon-lime)', fontWeight: '700', fontSize: '0.85rem' }}>
                "{pA.nickname}"
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.25rem', marginTop: '0.2rem' }}>
                {pA.elo} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Elo</span>
              </div>
            </div>
          </div>

          {/* VS Center Pillar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 1rem'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '0.95rem',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.4)'
              }}
            >
              VS
            </div>
            <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Tỉ Số Đối Đầu
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.1rem' }}>
                {winsA} - {winsB}
              </div>
            </div>
          </div>

          {/* Player B Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'flex-end', textAlign: 'right' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{pB.name}</h3>
              <span style={{ color: 'var(--neon-cyan)', fontWeight: '700', fontSize: '0.85rem' }}>
                "{pB.nickname}"
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.25rem', marginTop: '0.2rem' }}>
                {pB.elo} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Elo</span>
              </div>
            </div>
            <img
              src={pB.avatar}
              alt={pB.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                border: '2px solid var(--neon-cyan)'
              }}
            />
          </div>
        </div>

        {/* Win Probability Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--neon-lime)', fontWeight: '700' }}>
              Xác suất thắng của {pA.nickname}: {winProbabilityA}%
            </span>
            <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>
              Xác suất thắng của {pB.nickname}: {100 - winProbabilityA}%
            </span>
          </div>
          <div
            style={{
              height: '8px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(6, 182, 212, 0.4)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${winProbabilityA}%`,
                height: '100%',
                backgroundColor: 'var(--neon-lime)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Historical Head to Head Matchups */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.6rem', color: 'var(--text-secondary)' }}>
            Lịch Sử Các Trận Hai Người Đối Đầu Nhau ({h2hMatches.length})
          </h4>
          {h2hMatches.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Chưa có trận đối đầu trực tiếp nào giữa {pA.name} và {pB.name} trong hệ thống CLB.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {h2hMatches.map(m => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: '700' }}>{m.teamA.name}</span> vs{' '}
                    <span style={{ fontWeight: '700' }}>{m.teamB.name}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.notes}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '800' }}>
                    {m.scoreA} : {m.scoreB}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
