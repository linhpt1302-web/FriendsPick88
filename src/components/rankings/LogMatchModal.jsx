import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useClub } from '../../context/ClubContext';
import { PlusCircle, Trophy, Swords, Zap, HelpCircle } from 'lucide-react';
import { calculateDoublesElo } from '../../utils/eloCalculator';

export function LogMatchModal({ isOpen, onClose }) {
  const { members, logMatch, requireAdmin } = useClub();

  const [matchType, setMatchType] = useState('regular'); // 'regular' | 'tournament' | 'final'
  const [p1Id, setP1Id] = useState('');
  const [p2Id, setP2Id] = useState('');
  const [p3Id, setP3Id] = useState('');
  const [p4Id, setP4Id] = useState('');

  // Regular/Tournament Single Set Score (First to 15)
  const [scoreA, setScoreA] = useState(15);
  const [scoreB, setScoreB] = useState(11);

  // Final Bo3 Sets
  const [set1A, setSet1A] = useState(11);
  const [set1B, setSet1B] = useState(8);
  const [set2A, setSet2A] = useState(9);
  const [set2B, setSet2B] = useState(11);
  const [set3A, setSet3A] = useState(11);
  const [set3B, setSet3B] = useState(7);

  const [notes, setNotes] = useState('');

  // Default player selection when opened
  useEffect(() => {
    if (isOpen && members.length >= 4) {
      if (!p1Id) setP1Id(members[0]?.id || '');
      if (!p2Id) setP2Id(members[1]?.id || '');
      if (!p3Id) setP3Id(members[2]?.id || '');
      if (!p4Id) setP4Id(members[3]?.id || '');
    }
  }, [isOpen, members]);

  // Selected player objects
  const p1 = members.find((m) => m.id === p1Id);
  const p2 = members.find((m) => m.id === p2Id);
  const p3 = members.find((m) => m.id === p3Id);
  const p4 = members.find((m) => m.id === p4Id);

  // Live Elo Prediction Calculation
  let predictedElo = null;
  if (p1 && p2 && p3 && p4) {
    const isDistinct = new Set([p1Id, p2Id, p3Id, p4Id]).size === 4;
    if (isDistinct) {
      const isTeamAWon = matchType === 'final'
        ? (set1A > set1B ? 1 : 0) + (set2A > set2B ? 1 : 0) + (set3A > set3B ? 1 : 0) >= 2
        : Number(scoreA) > Number(scoreB);

      predictedElo = calculateDoublesElo(
        [p1.elo, p2.elo],
        [p3.elo, p4.elo],
        matchType === 'final' ? 2 : Number(scoreA),
        matchType === 'final' ? 1 : Number(scoreB),
        isTeamAWon
      );
    }
  }

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!requireAdmin()) return;

    // Validate 4 distinct players
    const playerIds = [p1Id, p2Id, p3Id, p4Id];
    const uniqueIds = new Set(playerIds);
    if (uniqueIds.size !== 4) {
      alert('Vui lòng chọn 4 vận động viên khác nhau cho 2 đội.');
      return;
    }

    let finalScoreA = Number(scoreA);
    let finalScoreB = Number(scoreB);
    let setsData = [];

    if (matchType === 'final') {
      // Best of 3 sets
      const s1A = Number(set1A), s1B = Number(set1B);
      const s2A = Number(set2A), s2B = Number(set2B);
      const s3A = Number(set3A), s3B = Number(set3B);

      let setsWonA = 0;
      let setsWonB = 0;
      if (s1A > s1B) setsWonA++; else setsWonB++;
      if (s2A > s2B) setsWonA++; else setsWonB++;

      setsData = [
        { setNum: 1, scoreA: s1A, scoreB: s1B },
        { setNum: 2, scoreA: s2A, scoreB: s2B }
      ];

      if (setsWonA === 1 && setsWonB === 1) {
        if (s3A > s3B) setsWonA++; else setsWonB++;
        setsData.push({ setNum: 3, scoreA: s3A, scoreB: s3B });
      }

      if (setsWonA === setsWonB) {
        alert('Trận chung kết Bo3 phải có đội thắng 2 set!');
        return;
      }

      finalScoreA = setsWonA;
      finalScoreB = setsWonB;
    } else {
      // Regular / Group stage: 1 Set to 15, win by 2
      if (finalScoreA === finalScoreB) {
        alert('Trận đấu không thể kết thúc với tỉ số hòa.');
        return;
      }
      if (Math.max(finalScoreA, finalScoreB) < 15) {
        alert('Trận đấu đôi tiêu chuẩn phải thi đấu chạm đến 15 điểm.');
        return;
      }
      if (Math.abs(finalScoreA - finalScoreB) < 2) {
        alert('Luật thi đấu Pickleball yêu cầu cách biệt tối thiểu 2 điểm.');
        return;
      }
      setsData = [{ setNum: 1, scoreA: finalScoreA, scoreB: finalScoreB }];
    }

    logMatch({
      type: matchType,
      teamA: {
        player1Id: p1Id,
        player2Id: p2Id
      },
      teamB: {
        player1Id: p3Id,
        player2Id: p4Id
      },
      scoreA: finalScoreA,
      scoreB: finalScoreB,
      sets: setsData,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ghi Điểm Trận Đấu & Cập Nhật Elo"
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary"
            style={{ fontWeight: '700' }}
          >
            <Trophy size={16} />
            <span>Lưu & Cập Nhật Bảng Xếp Hạng</span>
          </button>
        </>
      }
    >
      <form id="log-match-form" onSubmit={handleSubmit}>
        {/* Match Type Switcher */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Thể Thức Thi Đấu</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setMatchType('regular')}
              className={`btn btn-sm ${matchType === 'regular' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Swords size={14} />
              <span>Giao Hữu Bậc Thang (Chạm 15)</span>
            </button>
            <button
              type="button"
              onClick={() => setMatchType('tournament')}
              className={`btn btn-sm ${matchType === 'tournament' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Zap size={14} />
              <span>Vòng Bảng Giải Đấu (Chạm 15)</span>
            </button>
            <button
              type="button"
              onClick={() => setMatchType('final')}
              className={`btn btn-sm ${matchType === 'final' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Trophy size={14} />
              <span>Chung Kết Vô Địch (Bo3 Chạm 11)</span>
            </button>
          </div>
        </div>

        {/* 2 Teams Roster Selection */}
        <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Team A */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(204, 255, 0, 0.04)',
              border: '1px solid var(--border-lime)'
            }}
          >
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--neon-lime)' }}>ĐỘI A</strong>
              {p1 && p2 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Elo TB: <strong style={{ color: 'var(--neon-lime)' }}>{Math.round((p1.elo + p2.elo) / 2)}</strong>
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>VĐV 1 (Bên Trái)</label>
              <select
                className="form-select"
                value={p1Id}
                onChange={(e) => setP1Id(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.id === p2Id || m.id === p3Id || m.id === p4Id}>
                    {m.name} ({m.nickname}) - {m.elo} Elo
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>VĐV 2 (Bên Phải)</label>
              <select
                className="form-select"
                value={p2Id}
                onChange={(e) => setP2Id(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.id === p1Id || m.id === p3Id || m.id === p4Id}>
                    {m.name} ({m.nickname}) - {m.elo} Elo
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team B */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(6, 182, 212, 0.04)',
              border: '1px solid var(--border-cyan)'
            }}
          >
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--neon-cyan)' }}>ĐỘI B</strong>
              {p3 && p4 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Elo TB: <strong style={{ color: 'var(--neon-cyan)' }}>{Math.round((p3.elo + p4.elo) / 2)}</strong>
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>VĐV 1 (Bên Trái)</label>
              <select
                className="form-select"
                value={p3Id}
                onChange={(e) => setP3Id(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.id === p1Id || m.id === p2Id || m.id === p4Id}>
                    {m.name} ({m.nickname}) - {m.elo} Elo
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>VĐV 2 (Bên Phải)</label>
              <select
                className="form-select"
                value={p4Id}
                onChange={(e) => setP4Id(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.id === p1Id || m.id === p2Id || m.id === p3Id}>
                    {m.name} ({m.nickname}) - {m.elo} Elo
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Score Inputs */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem'
          }}
        >
          <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '1rem' }}>
            {matchType === 'final' ? 'Kết Quả Các Set (Chung kết Bo3 - Chạm 11 điểm/set)' : 'Tỉ Số Trận Đấu (1 Set Chạm 15 Điểm - Cách biệt 2)'}
          </label>

          {matchType === 'final' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <span style={{ minWidth: '60px', fontWeight: '600', fontSize: '0.85rem' }}>Set 1:</span>
                <input
                  type="number"
                  min="0"
                  max="25"
                  className="form-control"
                  style={{ width: '80px', textAlign: 'center', fontSize: '1.1rem', fontWeight: '700' }}
                  value={set1A}
                  onChange={(e) => setSet1A(e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  min="0"
                  max="25"
                  className="form-control"
                  style={{ width: '80px', textAlign: 'center', fontSize: '1.1rem', fontWeight: '700' }}
                  value={set1B}
                  onChange={(e) => setSet1B(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <span style={{ minWidth: '60px', fontWeight: '600', fontSize: '0.85rem' }}>Set 2:</span>
                <input
                  type="number"
                  min="0"
                  max="25"
                  className="form-control"
                  style={{ width: '80px', textAlign: 'center', fontSize: '1.1rem', fontWeight: '700' }}
                  value={set2A}
                  onChange={(e) => setSet2A(e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  min="0"
                  max="25"
                  className="form-control"
                  style={{ width: '80px', textAlign: 'center', fontSize: '1.1rem', fontWeight: '700' }}
                  value={set2B}
                  onChange={(e) => setSet2B(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <span style={{ minWidth: '60px', fontWeight: '600', fontSize: '0.85rem' }}>Set 3 (Nếu hòa):</span>
                <input
                  type="number"
                  min="0"
                  max="25"
                  className="form-control"
                  style={{ width: '80px', textAlign: 'center', fontSize: '1.1rem', fontWeight: '700' }}
                  value={set3A}
                  onChange={(e) => setSet3A(e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  min="0"
                  max="25"
                  className="form-control"
                  style={{ width: '80px', textAlign: 'center', fontSize: '1.1rem', fontWeight: '700' }}
                  value={set3B}
                  onChange={(e) => setSet3B(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--neon-lime)', fontWeight: '700' }}>Đội A</span>
                <input
                  type="number"
                  min="0"
                  max="35"
                  className="form-control"
                  style={{ width: '100px', fontSize: '1.75rem', textAlign: 'center', fontWeight: '800', marginTop: '0.4rem' }}
                  value={scoreA}
                  onChange={(e) => setScoreA(e.target.value)}
                />
              </div>

              <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-muted)' }}>:</span>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--neon-cyan)', fontWeight: '700' }}>Đội B</span>
                <input
                  type="number"
                  min="0"
                  max="35"
                  className="form-control"
                  style={{ width: '100px', fontSize: '1.75rem', textAlign: 'center', fontWeight: '800', marginTop: '0.4rem' }}
                  value={scoreB}
                  onChange={(e) => setScoreB(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Elo Forecast Pill */}
        {predictedElo && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(204, 255, 0, 0.06)',
              border: '1px solid rgba(204, 255, 0, 0.25)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              fontSize: '0.85rem'
            }}
          >
            <div className="flex-between" style={{ marginBottom: '0.3rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Dự báo biến động điểm Elo:</span>
              <strong style={{ color: 'var(--neon-lime)' }}>
                Đội A: {predictedElo.teamAChange >= 0 ? `+${predictedElo.teamAChange}` : predictedElo.teamAChange} điểm | Đội B: {predictedElo.teamBChange >= 0 ? `+${predictedElo.teamBChange}` : predictedElo.teamBChange} điểm
              </strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Xác suất thắng ước tính trước trận: Đội A ({Math.round(predictedElo.teamAExpected * 100)}%) vs Đội B ({Math.round(predictedElo.teamBExpected * 100)}%)
            </div>
          </div>
        )}

        {/* Match Notes */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Ghi Chú Trận Đấu (Tùy chọn)</label>
          <input
            type="text"
            className="form-control"
            placeholder="VD: Trận đấu kịch tính kéo dài 30 phút, pha bóng bền 20 chạm..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
