import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { calculateGroupStandings, getBestThirdPlacedTeams } from '../../utils/tournamentEngine';
import { Modal } from '../common/Modal';
import { CheckCircle2, Play, Trophy, Sparkles, Swords, ArrowRight, Award } from 'lucide-react';

export function GroupStageView({ tournament, onNavigateToKnockout }) {
  const { updateTournamentMatchScore, requireAdmin } = useClub();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scoreA, setScoreA] = useState(15);
  const [scoreB, setScoreB] = useState(11);

  if (!tournament.groups || tournament.groups.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Không có dữ liệu vòng bảng cho giải đấu này.
      </div>
    );
  }

  const isOddGroups = tournament.groups.length % 2 !== 0 && tournament.groups.length >= 3;
  const bestThirds = isOddGroups ? getBestThirdPlacedTeams(tournament.groups, 2) : [];

  // Check if all group stage matches across all groups are completed
  const totalGroupMatches = tournament.groups.reduce((acc, g) => acc + g.matches.length, 0);
  const completedGroupMatches = tournament.groups.reduce((acc, g) => acc + g.matches.filter(m => m.status === 'completed').length, 0);
  const isAllGroupsCompleted = totalGroupMatches > 0 && totalGroupMatches === completedGroupMatches;

  const handleOpenScore = (match) => {
    requireAdmin(() => {
      setSelectedMatch(match);
      setScoreA(15);
      setScoreB(11);
    });
  };

  const handleSaveScore = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!requireAdmin()) return;
    if (!selectedMatch) return;

    const sA = Number(scoreA);
    const sB = Number(scoreB);

    if (sA === sB) {
      alert('Trận đấu Pickleball không có kết quả hòa.');
      return;
    }
    if (Math.max(sA, sB) < 15) {
      alert('Trận đấu vòng bảng phải thi đấu chạm đến 15 điểm.');
      return;
    }
    if (Math.abs(sA - sB) < 2) {
      alert('Luật Pickleball yêu cầu cách biệt tối thiểu 2 điểm.');
      return;
    }

    updateTournamentMatchScore(tournament.id, selectedMatch.id, sA, sB);
    setSelectedMatch(null);
  };

  return (
    <div>
      {/* Quarterfinals Ready Celebration Banner */}
      {isAllGroupsCompleted ? (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '2px solid var(--border-lime)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 0 30px rgba(204, 255, 0, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(204, 255, 0, 0.2)',
                color: 'var(--neon-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Trophy size={24} />
            </div>
            <div>
              <strong style={{ color: 'var(--neon-lime)', fontSize: '1.05rem', display: 'block' }}>
                🎉 Vòng Bảng Đã Hoàn Tất! Các Cặp Đấu Vòng Tứ Kết Đã Được Tạo Tự Động
              </strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                {isOddGroups 
                  ? 'Các đội Nhất, Nhì và các Đội Hạng 3 Xuất Sắc Nhất đã được phân nhánh tự động vào Vòng Tứ Kết.'
                  : 'Các đội Nhất & Nhì mỗi bảng đã được phân nhánh tự động vào 4 cặp đấu Tứ Kết.'}
              </p>
            </div>
          </div>

          {onNavigateToKnockout && (
            <button
              onClick={onNavigateToKnockout}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.25rem' }}
            >
              <Swords size={17} />
              <span>Xem & Đấu Vòng Tứ Kết Ngay</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      ) : (
        /* Regular Informational Banner */
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} style={{ color: 'var(--neon-cyan)' }} />
            <div>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                Quy tắc thi đấu Vòng Bảng (Chạm 15 điểm)
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                {isOddGroups ? (
                  <span>
                    Giải gồm <strong>{tournament.groups.length} bảng đấu (số bảng lẻ)</strong>: Top 2 mỗi bảng và <strong>các đội Hạng 3 có thành tích tốt nhất ⭐</strong> sẽ giành vé vào Vòng Tứ Kết.
                  </span>
                ) : (
                  <span>
                    Top 2 cặp đôi dẫn đầu mỗi bảng (Hạng 1 & 2 ⭐) sẽ <strong>tự động tiến vào Vòng Tứ Kết</strong> ngay khi có kết quả.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--neon-lime)', fontWeight: '700' }}>
            ⚡ Tiến độ: {completedGroupMatches}/{totalGroupMatches} Trận Đã Đấu
          </div>
        </div>
      )}

      {/* If Odd Groups: Display Wildcard 3rd-Placed Rankings Table */}
      {isOddGroups && bestThirds.length > 0 && (
        <div
          className="glass-card"
          style={{
            padding: '1.25rem',
            marginBottom: '2rem',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)'
          }}
        >
          <div className="flex-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} style={{ color: '#fbbf24' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#fbbf24' }}>
                Bảng Xếp Hạng Các Đội Hạng 3 Xuất Sắc Nhất (Vé Vớt Tứ Kết)
              </h4>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Top 2 Đội Dẫn Đầu ⭐ Sẽ Giành Vé Vào Tứ Kết
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Hạng Vé Vớt</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Cặp Đôi</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Bảng Đấu</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Đã Đấu</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Thắng</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Thua</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Hiệu Số</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {bestThirds.map((team, idx) => (
                  <tr key={team.teamId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <strong style={{ color: '#fbbf24' }}>#{idx + 1}</strong>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <strong>{team.teamName}</strong>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--neon-cyan)' }}>
                      {team.groupName}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{team.played}</td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: '#34d399', fontWeight: '700' }}>{team.won}</td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: '#f87171' }}>{team.lost}</td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: '700', color: team.pointsDiff >= 0 ? 'var(--neon-lime)' : '#f87171' }}>
                      {team.pointsDiff > 0 ? `+${team.pointsDiff}` : team.pointsDiff}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                      <span
                        style={{
                          backgroundColor: 'rgba(204, 255, 0, 0.15)',
                          color: 'var(--neon-lime)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '0.72rem'
                        }}
                      >
                        ⭐ Vào Tứ Kết
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid of Groups */}
      <div className="grid-2" style={{ gap: '2rem' }}>
        {tournament.groups.map(group => {
          const standings = calculateGroupStandings(group.teams, group.matches);

          return (
            <div key={group.id} className="glass-card" style={{ padding: '1.25rem' }}>
              {/* Group Header */}
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--neon-lime)' }}>
                    {group.name}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      backgroundColor: 'rgba(204, 255, 0, 0.1)',
                      color: 'var(--neon-lime)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      fontWeight: '700'
                    }}
                  >
                    {group.teams.length} Cặp Đôi
                  </span>
                </div>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {group.matches.filter(m => m.status === 'completed').length}/{group.matches.length} Trận Đã Đấu
                </span>
              </div>

              {/* Standings Table */}
              <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: 'rgba(0, 0, 0, 0.25)',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase'
                      }}
                    >
                      <th style={{ padding: '0.6rem 0.75rem' }}>Hạng</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Cặp Đôi</th>
                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Đã Đấu</th>
                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>T</th>
                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>B</th>
                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Hiệu Số</th>
                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>% Thắng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((st, idx) => {
                      const isTopTwo = idx < 2;
                      const isBestThirdCandidate = isOddGroups && idx === 2;

                      return (
                        <tr
                          key={st.teamId}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: isTopTwo 
                              ? 'rgba(204, 255, 0, 0.04)' 
                              : isBestThirdCandidate ? 'rgba(245, 158, 11, 0.04)' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            <span
                              style={{
                                fontWeight: '800',
                                color: idx === 0 ? '#fbbf24' : idx === 1 ? '#22d3ee' : isBestThirdCandidate ? '#f59e0b' : 'var(--text-muted)'
                              }}
                            >
                              {idx + 1} {isTopTwo ? '⭐' : isBestThirdCandidate ? '🥉' : ''}
                            </span>
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>{st.teamName}</strong>
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>{st.played}</td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: '700', color: '#34d399' }}>{st.won}</td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#f87171' }}>{st.lost}</td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: '700', color: st.pointsDiff >= 0 ? 'var(--neon-lime)' : '#f87171' }}>
                            {st.pointsDiff > 0 ? `+${st.pointsDiff}` : st.pointsDiff}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: '700' }}>
                            {st.winRate}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Group Fixture Matches */}
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  Lịch Thi Đấu {group.name}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {group.matches.map(m => {
                    const isCompleted = m.status === 'completed';
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(15, 23, 42, 0.5)',
                          border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '700' }}>
                            <span style={{ color: m.winnerId === m.teamA.id ? 'var(--neon-lime)' : 'var(--text-primary)' }}>
                              {m.teamA.name}
                            </span>
                            <span style={{ margin: '0 0.4rem', color: 'var(--text-muted)' }}>vs</span>
                            <span style={{ color: m.winnerId === m.teamB.id ? 'var(--neon-lime)' : 'var(--text-primary)' }}>
                              {m.teamB.name}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {isCompleted ? `Tỉ số: ${m.scoreA} - ${m.scoreB}` : 'Chưa đấu (Chạm 15)'}
                          </span>
                        </div>

                        <div>
                          {isCompleted ? (
                            <div
                              style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                                fontWeight: '800',
                                fontFamily: 'var(--font-mono)'
                              }}
                            >
                              {m.scoreA} : {m.scoreB}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenScore(m)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
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
            </div>
          );
        })}
      </div>

      {/* Match Score Entry Modal */}
      {selectedMatch && (
        <Modal
          isOpen={Boolean(selectedMatch)}
          onClose={() => setSelectedMatch(null)}
          title={`Ghi Điểm Trận: ${selectedMatch.roundName}`}
          size="md"
          footer={
            <>
              <button type="button" onClick={() => setSelectedMatch(null)} className="btn btn-secondary">
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveScore}
                className="btn btn-primary"
              >
                Lưu & Cập Nhật Điểm Bảng
              </button>
            </>
          }
        >
          <form id="group-score-form-view" onSubmit={handleSaveScore}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                <span style={{ color: 'var(--neon-lime)' }}>{selectedMatch.teamA.name}</span>
                <span style={{ margin: '0 0.6rem', color: 'var(--text-muted)' }}>đối đầu</span>
                <span style={{ color: 'var(--neon-cyan)' }}>{selectedMatch.teamB.name}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Vòng Bảng: Thi đấu 1 Set chạm 15 điểm (Cách biệt 2)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '1.5rem 0' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--neon-lime)', fontWeight: '700' }}>
                  {selectedMatch.teamA.name}
                </span>
                <input
                  type="number"
                  min="0"
                  max="35"
                  className="form-control"
                  style={{ width: '90px', fontSize: '1.75rem', textAlign: 'center', fontWeight: '800', marginTop: '0.3rem' }}
                  value={scoreA}
                  onChange={(e) => setScoreA(e.target.value)}
                />
              </div>

              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>:</span>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--neon-cyan)', fontWeight: '700' }}>
                  {selectedMatch.teamB.name}
                </span>
                <input
                  type="number"
                  min="0"
                  max="35"
                  className="form-control"
                  style={{ width: '90px', fontSize: '1.75rem', textAlign: 'center', fontWeight: '800', marginTop: '0.3rem' }}
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
