import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Modal } from '../common/Modal';
import { ChampionPodium } from './ChampionPodium';
import { CheckCircle2, Play, Trophy, Sparkles, Edit3 } from 'lucide-react';

export function SingleEliminationBracket({ tournament }) {
  const { updateTournamentMatchScore, requireAdmin, currentUser } = useClub();
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [scoreA, setScoreA] = useState(15);
  const [scoreB, setScoreB] = useState(11);

  const [set1A, setSet1A] = useState(11);
  const [set1B, setSet1B] = useState(8);
  const [set2A, setSet2A] = useState(9);
  const [set2B, setSet2B] = useState(11);
  const [set3A, setSet3A] = useState(11);
  const [set3B, setSet3B] = useState(7);

  const { rounds, champion } = tournament.bracket || { rounds: [] };

  const handleOpenScoreModal = (match) => {
    if (match.status === 'pending' || !match.teamA || !match.teamB) {
      alert('Trận đấu này đang chờ xác định các đội vượt qua vòng bảng hoặc vòng trước.');
      return;
    }

    requireAdmin(() => {
      setSelectedMatch(match);
      if (match.isFinal) {
        if (match.sets && match.sets.length >= 2) {
          setSet1A(match.sets[0]?.scoreA ?? 11);
          setSet1B(match.sets[0]?.scoreB ?? 8);
          setSet2A(match.sets[1]?.scoreA ?? 9);
          setSet2B(match.sets[1]?.scoreB ?? 11);
          setSet3A(match.sets[2]?.scoreA ?? 11);
          setSet3B(match.sets[2]?.scoreB ?? 7);
        } else {
          setSet1A(11); setSet1B(8);
          setSet2A(9); setSet2B(11);
          setSet3A(11); setSet3B(7);
        }
      } else {
        setScoreA(match.scoreA !== null ? match.scoreA : 15);
        setScoreB(match.scoreB !== null ? match.scoreB : 11);
      }
    });
  };

  const handleSaveScore = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedMatch) return;

    if (selectedMatch.isFinal) {
      const s1A = parseInt(set1A, 10) || 0, s1B = parseInt(set1B, 10) || 0;
      const s2A = parseInt(set2A, 10) || 0, s2B = parseInt(set2B, 10) || 0;
      const s3A = parseInt(set3A, 10) || 0, s3B = parseInt(set3B, 10) || 0;

      let setsWonA = 0;
      let setsWonB = 0;
      if (s1A > s1B) setsWonA++; else if (s1B > s1A) setsWonB++;
      if (s2A > s2B) setsWonA++; else if (s2B > s2A) setsWonB++;

      const sets = [
        { setNum: 1, scoreA: s1A, scoreB: s1B },
        { setNum: 2, scoreA: s2A, scoreB: s2B }
      ];

      if (setsWonA === 1 && setsWonB === 1) {
        if (s3A > s3B) setsWonA++; else if (s3B > s3A) setsWonB++;
        sets.push({ setNum: 3, scoreA: s3A, scoreB: s3B });
      }

      if (setsWonA === setsWonB) {
        alert('Trận chung kết cần có 1 đội thắng 2 set (Bo3).');
        return;
      }

      updateTournamentMatchScore(tournament.id, selectedMatch.id, setsWonA, setsWonB, sets);
    } else {
      const sA = parseInt(scoreA, 10);
      const sB = parseInt(scoreB, 10);

      if (isNaN(sA) || isNaN(sB)) {
        alert('Vui lòng nhập điểm số hợp lệ.');
        return;
      }

      if (sA === sB) {
        alert('Trận đấu Pickleball không có kết quả hòa.');
        return;
      }

      updateTournamentMatchScore(tournament.id, selectedMatch.id, sA, sB);
    }

    setSelectedMatch(null);
  };

  return (
    <div>
      {champion && (
        <ChampionPodium
          champion={champion}
          tournamentName={tournament.name}
          prizeTrophy={tournament.prizeTrophy}
        />
      )}

      {/* Bracket Tree Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
          overflowX: 'auto',
          paddingBottom: '1.5rem'
        }}
      >
        {rounds.map((round) => (
          <div key={round.roundNumber} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                textAlign: 'center',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <h3 style={{ fontSize: '1rem', color: round.roundNumber === 3 ? '#fbbf24' : 'var(--text-primary)', margin: 0 }}>
                {round.title}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {round.roundNumber === 3 ? 'Thắng 2/3 Set (Chạm 11)' : 'Trận Loại Trực Tiếp (Chạm 15)'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                minHeight: round.roundNumber === 1 ? '520px' : round.roundNumber === 2 ? '440px' : '360px',
                gap: '1.5rem'
              }}
            >
              {round.matches.map((match) => {
                const isReady = match.teamA && match.teamB;
                const isCompleted = match.status === 'completed';
                const isFinal = match.isFinal;

                const nameA = match.teamA?.name || match.slotA || 'TBD (Thắng Tứ Kết)';
                const nameB = match.teamB?.name || match.slotB || 'TBD (Thắng Tứ Kết)';

                return (
                  <div
                    key={match.id}
                    onClick={() => isReady && handleOpenScoreModal(match)}
                    className="glass-card"
                    style={{
                      padding: '1rem',
                      cursor: isReady ? 'pointer' : 'default',
                      border: isCompleted
                        ? '1px solid rgba(16, 185, 129, 0.4)'
                        : isReady
                        ? isFinal ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(204, 255, 0, 0.35)'
                        : '1px solid var(--border-subtle)',
                      background: isReady ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0.4)',
                      opacity: isReady ? 1 : 0.65,
                      boxShadow: isReady ? 'var(--shadow-md)' : 'none',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '0.6rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{match.roundName}</span>
                      {isCompleted ? (
                        <span style={{ color: '#34d399', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 size={12} /> Đã Đấu (Sửa Điểm)
                        </span>
                      ) : isReady ? (
                        <span style={{ color: isFinal ? '#fbbf24' : 'var(--neon-lime)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Edit3 size={12} /> Nhập Điểm
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Đang đợi vòng trước</span>
                      )}
                    </div>

                    {/* Team 1 Row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '4px',
                        backgroundColor: match.winnerId === match.teamA?.id ? 'rgba(204, 255, 0, 0.12)' : 'transparent',
                        marginBottom: '0.35rem'
                      }}
                    >
                      <span
                        style={{
                          fontWeight: match.winnerId === match.teamA?.id ? '700' : '500',
                          color: match.winnerId === match.teamA?.id ? 'var(--neon-lime)' : match.teamA ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontSize: '0.9rem'
                        }}
                      >
                        {nameA}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '800',
                          color: match.winnerId === match.teamA?.id ? 'var(--neon-lime)' : 'var(--text-secondary)'
                        }}
                      >
                        {match.scoreA !== null ? match.scoreA : '-'}
                      </span>
                    </div>

                    {/* Team 2 Row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '4px',
                        backgroundColor: match.winnerId === match.teamB?.id ? 'rgba(204, 255, 0, 0.12)' : 'transparent'
                      }}
                    >
                      <span
                        style={{
                          fontWeight: match.winnerId === match.teamB?.id ? '700' : '500',
                          color: match.winnerId === match.teamB?.id ? 'var(--neon-lime)' : match.teamB ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontSize: '0.9rem'
                        }}
                      >
                        {nameB}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '800',
                          color: match.winnerId === match.teamB?.id ? 'var(--neon-lime)' : 'var(--text-secondary)'
                        }}
                      >
                        {match.scoreB !== null ? match.scoreB : '-'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bracket Match Score Input Modal */}
      {selectedMatch && (
        <Modal
          isOpen={Boolean(selectedMatch)}
          onClose={() => setSelectedMatch(null)}
          title={`Ghi Điểm Trận Đấu Knockout: ${selectedMatch.roundName}`}
          size="md"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
              <button type="button" onClick={() => setSelectedMatch(null)} className="btn btn-secondary">
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveScore}
                className="btn btn-primary"
                style={{ fontWeight: '700' }}
              >
                <CheckCircle2 size={16} />
                <span>Lưu & Đưa Đội Thắng Vào Vòng Sau</span>
              </button>
            </div>
          }
        >
          <form id="bracket-score-form" onSubmit={handleSaveScore}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                <span style={{ color: 'var(--neon-lime)' }}>{selectedMatch.teamA?.name}</span>
                <span style={{ margin: '0 0.6rem', color: 'var(--text-muted)' }}>đối đầu</span>
                <span style={{ color: 'var(--neon-cyan)' }}>{selectedMatch.teamB?.name}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedMatch.isFinal ? 'Chung Kết Tranh Cúp (Thắng 2/3 Set chạm 11)' : 'Trận Loại Trực Tiếp (Nhập điểm 2 đội)'}
              </span>
            </div>

            {selectedMatch.isFinal ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Set 1:</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    className="form-control"
                    style={{ width: '80px', textAlign: 'center', fontWeight: '700' }}
                    value={set1A}
                    onChange={(e) => setSet1A(e.target.value)}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    className="form-control"
                    style={{ width: '80px', textAlign: 'center', fontWeight: '700' }}
                    value={set1B}
                    onChange={(e) => setSet1B(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Set 2:</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    className="form-control"
                    style={{ width: '80px', textAlign: 'center', fontWeight: '700' }}
                    value={set2A}
                    onChange={(e) => setSet2A(e.target.value)}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    className="form-control"
                    style={{ width: '80px', textAlign: 'center', fontWeight: '700' }}
                    value={set2B}
                    onChange={(e) => setSet2B(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Set 3 (Nếu hòa 1-1):</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    className="form-control"
                    style={{ width: '80px', textAlign: 'center', fontWeight: '700' }}
                    value={set3A}
                    onChange={(e) => setSet3A(e.target.value)}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    className="form-control"
                    style={{ width: '80px', textAlign: 'center', fontWeight: '700' }}
                    value={set3B}
                    onChange={(e) => setSet3B(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.25rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--neon-lime)', fontWeight: '700' }}>
                    {selectedMatch.teamA?.name}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    className="form-control"
                    style={{ width: '90px', fontSize: '1.5rem', textAlign: 'center', fontWeight: '800', marginTop: '0.3rem' }}
                    value={scoreA}
                    onChange={(e) => setScoreA(e.target.value)}
                    autoFocus
                  />
                </div>

                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-muted)' }}>:</span>

                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', fontWeight: '700' }}>
                    {selectedMatch.teamB?.name}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    className="form-control"
                    style={{ width: '90px', fontSize: '1.5rem', textAlign: 'center', fontWeight: '800', marginTop: '0.3rem' }}
                    value={scoreB}
                    onChange={(e) => setScoreB(e.target.value)}
                  />
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
