import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { calculateRoundRobinStandings } from '../../utils/tournamentEngine';
import { Modal } from '../common/Modal';

export function RoundRobinTable({ tournament }) {
  const { updateTournamentMatchScore, requireAdmin } = useClub();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scoreA, setScoreA] = useState(15);
  const [scoreB, setScoreB] = useState(12);

  const standings = calculateRoundRobinStandings(
    tournament.teams || [],
    tournament.groupMatches || []
  );

  const handleOpenScore = (match) => {
    requireAdmin(() => {
      setSelectedMatch(match);
      setScoreA(15);
      setScoreB(12);
    });
  };

  const handleSaveScore = (e) => {
    e.preventDefault();
    if (!requireAdmin()) return;
    if (!selectedMatch) return;
    updateTournamentMatchScore(tournament.id, selectedMatch.id, Number(scoreA), Number(scoreB));
    setSelectedMatch(null);
  };

  return (
    <div>
      {/* Standings Table Card */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Bảng Điểm Xếp Hạng Vòng Bảng</h3>
          <p style={{ fontSize: '0.85rem' }}>Top 2 cặp đôi dẫn đầu sẽ giành vé vào trận Chung Kết Tranh Cúp.</p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'rgba(0, 0, 0, 0.25)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase'
                }}
              >
                <th style={{ padding: '0.85rem 1.25rem' }}>Hạng</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Cặp Đôi</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Đã Đấu</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Thắng</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Thua</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Điểm Ghi</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Điểm Mất</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Hiệu Số</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>% Thắng</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((st, idx) => {
                const isPlayoffZone = idx < 2;
                return (
                  <tr
                    key={st.teamId}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isPlayoffZone ? 'rgba(204, 255, 0, 0.03)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <span
                        style={{
                          fontWeight: '800',
                          color: idx === 0 ? '#fbbf24' : idx === 1 ? '#22d3ee' : 'var(--text-muted)'
                        }}
                      >
                        {idx + 1} {isPlayoffZone && '⭐'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{st.teamName}</strong>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>{st.played}</td>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#34d399' }}>{st.won}</td>
                    <td style={{ padding: '0.85rem 1.25rem', color: '#f87171' }}>{st.lost}</td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>{st.pointsFor}</td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>{st.pointsAgainst}</td>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: st.pointsDiff >= 0 ? 'var(--neon-lime)' : '#f87171' }}>
                      {st.pointsDiff > 0 ? `+${st.pointsDiff}` : st.pointsDiff}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700' }}>
                      {st.winRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Group Match Fixtures */}
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Lịch Thi Đấu Vòng Bảng (Chạm 15)</h3>
        <div className="grid-2">
          {tournament.groupMatches?.map((match) => {
            const isCompleted = match.status === 'completed';
            return (
              <div
                key={match.id}
                className="glass-card"
                style={{
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                    <span style={{ color: match.winnerId === match.teamA.id ? 'var(--neon-lime)' : 'var(--text-primary)' }}>
                      {match.teamA.name}
                    </span>
                    <span style={{ margin: '0 0.4rem', color: 'var(--text-muted)' }}>vs</span>
                    <span style={{ color: match.winnerId === match.teamB.id ? 'var(--neon-lime)' : 'var(--text-primary)' }}>
                      {match.teamB.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {isCompleted ? `Tỉ số: ${match.scoreA} - ${match.scoreB}` : 'Chưa đấu (1 set chạm 15)'}
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <div
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        fontWeight: '800',
                        fontSize: '0.9rem'
                      }}
                    >
                      {match.scoreA} : {match.scoreB}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenScore(match)}
                      className="btn btn-outline btn-sm"
                    >
                      <span>Nhập Điểm</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for score entry */}
      {selectedMatch && (
        <Modal
          isOpen={Boolean(selectedMatch)}
          onClose={() => setSelectedMatch(null)}
          title="Nhập Điểm Trận Đấu Vòng Bảng"
          size="md"
          footer={
            <>
              <button type="button" onClick={() => setSelectedMatch(null)} className="btn btn-secondary">
                Hủy Bỏ
              </button>
              <button type="submit" form="rr-score-form" className="btn btn-primary">
                Lưu Kết Quả
              </button>
            </>
          }
        >
          <form id="rr-score-form" onSubmit={handleSaveScore}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '1rem 0' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--neon-lime)', fontWeight: '700' }}>
                  {selectedMatch.teamA.name}
                </span>
                <input
                  type="number"
                  min="0"
                  max="35"
                  className="form-control"
                  style={{ width: '90px', fontSize: '1.5rem', textAlign: 'center', fontWeight: '800', marginTop: '0.3rem' }}
                  value={scoreA}
                  onChange={(e) => setScoreA(e.target.value)}
                />
              </div>

              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-muted)' }}>:</span>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--neon-cyan)', fontWeight: '700' }}>
                  {selectedMatch.teamB.name}
                </span>
                <input
                  type="number"
                  min="0"
                  max="35"
                  className="form-control"
                  style={{ width: '90px', fontSize: '1.5rem', textAlign: 'center', fontWeight: '800', marginTop: '0.3rem' }}
                  value={scoreB}
                  onChange={(e) => setScoreB(e.target.value)}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
