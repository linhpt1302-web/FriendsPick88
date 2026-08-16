import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useClub } from '../../context/ClubContext';
import { DIVISION_LETTERS, DIVISION_NAMES } from '../../utils/tournamentEngine';
import { 
  Swords, 
  Users, 
  Shuffle, 
  Plus, 
  Trash2, 
  Sparkles, 
  Layers, 
  Settings2,
  ChevronRight,
  Zap
} from 'lucide-react';

export function CreateTournamentModal({ isOpen, onClose }) {
  const { members, createTournament, requireAdmin, setActiveTournamentId } = useClub();

  const [name, setName] = useState('Giải Đôi Vô Địch CLB Friends 2026');
  const [numTeams, setNumTeams] = useState(8);
  const [numDivisions, setNumDivisions] = useState(4);
  const [surface, setSurface] = useState('Sân Trung tâm 1 & 2');
  const [prizeTrophy, setPrizeTrophy] = useState('Cúp Vàng & Cặp Vợt Selkirk Pro 🏆');
  const [description, setDescription] = useState('Giải đấu đôi chính thức CLB Friends: Vòng bảng tính điểm ➔ Tứ kết ➔ Bán kết ➔ Chung kết Bo3.');

  const [teamsList, setTeamsList] = useState([]);

  // Initialize or re-generate teams list when numTeams or numDivisions changes
  useEffect(() => {
    if (!isOpen) return;

    if (!name) {
      setName(`Giải Đôi Vô Địch CLB Friends - Mùa ${new Date().getMonth() + 1}/${new Date().getFullYear()}`);
    }

    const availableMembers = members && members.length >= 2 ? [...members] : [
      { id: 'p-1', name: 'Phạm Linh', nickname: 'Linh', elo: 1260 },
      { id: 'p-2', name: 'Tuấn Anh', nickname: 'Tuấn Anh', elo: 1260 }
    ];

    const initialTeams = [];

    for (let i = 0; i < numTeams; i++) {
      const p1Index = (i * 2) % availableMembers.length;
      const p2Index = (i * 2 + 1) % availableMembers.length;
      const p1 = availableMembers[p1Index] || availableMembers[0];
      const p2 = availableMembers[p2Index] || availableMembers[1];

      const assignedGroupCode = DIVISION_LETTERS[i % Math.min(numDivisions, 10)];
      const avgElo = Math.round(((p1.elo || 1150) + (p2.elo || 1150)) / 2);

      initialTeams.push({
        id: `team-custom-${i + 1}`,
        name: `${p1.nickname || p1.name.split(' ')[0]} & ${p2.nickname || p2.name.split(' ')[0]}`,
        player1Id: p1.id,
        player2Id: p2.id,
        groupCode: assignedGroupCode,
        avgElo
      });
    }

    setTeamsList(initialTeams);
  }, [isOpen, numTeams, numDivisions, members]);

  const handlePlayerChange = (teamIndex, slot, newPlayerId) => {
    setTeamsList(prev => {
      const updated = [...prev];
      const team = { ...updated[teamIndex] };

      if (slot === 1) team.player1Id = newPlayerId;
      if (slot === 2) team.player2Id = newPlayerId;

      const p1 = members.find(m => m.id === team.player1Id) || members[0];
      const p2 = members.find(m => m.id === team.player2Id) || members[1];
      team.name = `${p1.nickname || p1.name.split(' ')[0]} & ${p2.nickname || p2.name.split(' ')[0]}`;
      team.avgElo = Math.round((p1.elo + p2.elo) / 2);

      updated[teamIndex] = team;
      return updated;
    });
  };

  const handleGroupChange = (teamIndex, newGroupCode) => {
    setTeamsList(prev => {
      const updated = [...prev];
      updated[teamIndex] = {
        ...updated[teamIndex],
        groupCode: newGroupCode
      };
      return updated;
    });
  };

  const handleTeamNameChange = (teamIndex, newName) => {
    setTeamsList(prev => {
      const updated = [...prev];
      updated[teamIndex] = { ...updated[teamIndex], name: newName };
      return updated;
    });
  };

  const handleAddTeam = () => {
    if (teamsList.length >= 30) {
      alert('Tối đa 30 đội tham gia một giải đấu.');
      return;
    }

    const nextIndex = teamsList.length;
    const p1 = members[nextIndex % members.length] || members[0];
    const p2 = members[(nextIndex + 1) % members.length] || members[1];
    const groupCode = DIVISION_LETTERS[nextIndex % numDivisions];

    setTeamsList(prev => [
      ...prev,
      {
        id: `team-custom-${nextIndex + 1}`,
        name: `${p1.nickname || p1.name.split(' ')[0]} & ${p2.nickname || p2.name.split(' ')[0]}`,
        player1Id: p1.id,
        player2Id: p2.id,
        groupCode,
        avgElo: Math.round((p1.elo + p2.elo) / 2)
      }
    ]);
    setNumTeams(prev => prev + 1);
  };

  const handleRemoveTeam = (teamIndex) => {
    if (teamsList.length <= 2) {
      alert('Giải đấu cần tối thiểu 2 đội tham gia.');
      return;
    }
    setTeamsList(prev => prev.filter((_, idx) => idx !== teamIndex));
    setNumTeams(prev => prev - 1);
  };

  const handleAutoSeedByElo = () => {
    const sortedMembers = [...members].sort((a, b) => b.elo - a.elo);
    const newTeams = [];

    for (let i = 0; i < teamsList.length; i++) {
      const p1 = sortedMembers[(i * 2) % sortedMembers.length];
      const p2 = sortedMembers[(i * 2 + 1) % sortedMembers.length];
      const avgElo = Math.round((p1.elo + p2.elo) / 2);

      newTeams.push({
        id: `team-custom-${i + 1}`,
        name: `${p1.nickname || p1.name.split(' ')[0]} & ${p2.nickname || p2.name.split(' ')[0]}`,
        player1Id: p1.id,
        player2Id: p2.id,
        groupCode: 'A',
        avgElo
      });
    }

    newTeams.sort((a, b) => b.avgElo - a.avgElo);
    newTeams.forEach((team, idx) => {
      const cycle = Math.floor(idx / numDivisions);
      const rem = idx % numDivisions;
      const targetGroupIndex = cycle % 2 === 0 ? rem : numDivisions - 1 - rem;
      team.groupCode = DIVISION_LETTERS[targetGroupIndex % numDivisions];
    });

    setTeamsList(newTeams);
  };

  const handleRandomizeDivisions = () => {
    setTeamsList(prev => {
      return prev.map(t => ({
        ...t,
        groupCode: DIVISION_LETTERS[Math.floor(Math.random() * numDivisions)]
      }));
    });
  };

  const divisionPreviewMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < numDivisions; i++) {
      const code = DIVISION_LETTERS[i];
      map[code] = teamsList.filter(t => t.groupCode === code);
    }
    return map;
  }, [teamsList, numDivisions]);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    requireAdmin(() => {
      const tourneyName = name.trim() || `Giải Đôi CLB Friends - Mùa ${new Date().getMonth() + 1}/${new Date().getFullYear()}`;

      if (teamsList.length < 2) {
        alert('Cần tối thiểu 2 đội để tạo giải đấu.');
        return;
      }

      const formattedTeams = teamsList.map(t => ({
        id: t.id,
        name: t.name,
        playerIds: [t.player1Id, t.player2Id],
        groupCode: t.groupCode,
        avgElo: t.avgElo
      }));

      const created = createTournament({
        name: tourneyName,
        surface: surface.trim() || 'Sân Trung tâm 1 & 2',
        prizeTrophy: prizeTrophy.trim() || 'Cúp Vàng & Vợt Selkirk Pro 🏆',
        description: description.trim() || 'Giải đấu đôi chính thức CLB Friends',
        date: `Tháng ${new Date().getMonth() + 1}, ${new Date().getFullYear()}`,
        teams: formattedTeams,
        numGroups: Number(numDivisions)
      });

      if (created) {
        setActiveTournamentId(created.id);
        alert(`Đã khởi tạo thành công giải đấu "${created.name}" với ${formattedTeams.length} đôi và ${numDivisions} bảng đấu!`);
      }

      onClose();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Giải Đấu & Xếp Bảng Thủ Công (1-30 Đội, 1-10 Bảng)"
      size="xl"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Tổng cộng: <strong style={{ color: 'var(--neon-lime)' }}>{teamsList.length} Đôi</strong> chia vào <strong style={{ color: 'var(--neon-cyan)' }}>{numDivisions} Bảng</strong>
          </span>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ fontWeight: '700' }}
            >
              <Swords size={18} />
              <span>Khởi Tạo Toàn Bộ Giải Đấu</span>
            </button>
          </div>
        </div>
      }
    >
      <form id="create-custom-tourney-form" onSubmit={handleSubmit}>
        {/* Section 1: Tournament Basic Parameters */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Settings2 size={18} style={{ color: 'var(--neon-lime)' }} />
            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
              1. Thông Tin & Quy Mô Giải Đấu
            </h4>
          </div>

          <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Tên Giải Đấu *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="VD: Giải Đôi Vô Địch CLB Friends 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Select Number of Teams (1-30) */}
            <div className="form-group">
              <label className="form-label">
                Số lượng đội tham gia: <strong style={{ color: 'var(--neon-lime)' }}>{numTeams} Đôi</strong> (2 đến 30)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={numTeams}
                  onChange={(e) => setNumTeams(Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--neon-lime)' }}
                />
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={numTeams}
                  onChange={(e) => setNumTeams(Math.max(2, Math.min(30, Number(e.target.value))))}
                  className="form-control"
                  style={{ width: '70px', textAlign: 'center', fontWeight: '800' }}
                />
              </div>
            </div>

            {/* Select Number of Divisions (1-10) */}
            <div className="form-group">
              <label className="form-label">
                Số lượng bảng đấu: <strong style={{ color: 'var(--neon-cyan)' }}>{numDivisions} Bảng</strong> (1 đến 10)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={numDivisions}
                  onChange={(e) => setNumDivisions(Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--neon-cyan)' }}
                />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numDivisions}
                  onChange={(e) => setNumDivisions(Math.max(1, Math.min(10, Number(e.target.value))))}
                  className="form-control"
                  style={{ width: '70px', textAlign: 'center', fontWeight: '800' }}
                />
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sân Thi Đấu</label>
              <input
                type="text"
                className="form-control"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Giải Thưởng / Cúp</label>
              <input
                type="text"
                className="form-control"
                value={prizeTrophy}
                onChange={(e) => setPrizeTrophy(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Manual Pairing & Division Arranging */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem'
          }}
        >
          <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--neon-lime)' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                2. Ghép Đội & Xếp Bảng Đấu Thủ Công ({teamsList.length} Đội)
              </h4>
            </div>

            {/* Quick helper buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAutoSeedByElo}
                className="btn btn-secondary btn-sm"
              >
                <Sparkles size={14} />
                <span>Xếp Hạt Giống Elo</span>
              </button>

              <button
                type="button"
                onClick={handleRandomizeDivisions}
                className="btn btn-secondary btn-sm"
              >
                <Shuffle size={14} />
                <span>Xếp Bảng Ngẫu Nhiên</span>
              </button>

              <button
                type="button"
                onClick={handleAddTeam}
                className="btn btn-primary btn-sm"
              >
                <Plus size={14} />
                <span>Thêm Đội</span>
              </button>
            </div>
          </div>

          {/* Teams Table / Cards */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              maxHeight: '260px',
              overflowY: 'auto',
              paddingRight: '0.5rem'
            }}
          >
            {teamsList.map((team, idx) => (
              <div
                key={team.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap'
                }}
              >
                <span style={{ fontWeight: '800', width: '32px', color: 'var(--text-muted)' }}>
                  #{idx + 1}
                </span>

                {/* Team Name Input */}
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '160px', fontSize: '0.85rem' }}
                  value={team.name}
                  onChange={(e) => handleTeamNameChange(idx, e.target.value)}
                  placeholder="Tên đội"
                />

                {/* Player 1 Dropdown */}
                <select
                  className="form-select"
                  style={{ flex: '1 1 140px', fontSize: '0.82rem' }}
                  value={team.player1Id}
                  onChange={(e) => handlePlayerChange(idx, 1, e.target.value)}
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.nickname}) - {m.elo}
                    </option>
                  ))}
                </select>

                <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>&</span>

                {/* Player 2 Dropdown */}
                <select
                  className="form-select"
                  style={{ flex: '1 1 140px', fontSize: '0.82rem' }}
                  value={team.player2Id}
                  onChange={(e) => handlePlayerChange(idx, 2, e.target.value)}
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.nickname}) - {m.elo}
                    </option>
                  ))}
                </select>

                {/* Division Selector (Bảng A, B, C...) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>BẢNG:</span>
                  <select
                    className="form-select"
                    style={{ width: '105px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--neon-lime)' }}
                    value={team.groupCode}
                    onChange={(e) => handleGroupChange(idx, e.target.value)}
                  >
                    {Array.from({ length: numDivisions }).map((_, gIdx) => (
                      <option key={DIVISION_LETTERS[gIdx]} value={DIVISION_LETTERS[gIdx]}>
                        {DIVISION_NAMES[gIdx]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Avg Elo */}
                <div style={{ textAlign: 'right', minWidth: '65px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--neon-lime)' }}>
                    {team.avgElo} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Elo</span>
                  </span>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveTeam(idx)}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.3rem', color: '#f87171' }}
                  title="Xóa đội"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Live Division Assignment Preview */}
        <div
          style={{
            background: 'rgba(204, 255, 0, 0.03)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(204, 255, 0, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Layers size={18} style={{ color: 'var(--neon-lime)' }} />
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--neon-lime)' }}>
              3. Xem Trước Phân Bổ Bảng Đấu ({numDivisions} Bảng)
            </h4>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
              gap: '0.75rem'
            }}
          >
            {Array.from({ length: numDivisions }).map((_, gIdx) => {
              const code = DIVISION_LETTERS[gIdx];
              const groupTeams = divisionPreviewMap[code] || [];

              return (
                <div
                  key={code}
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--neon-lime)', fontSize: '0.9rem' }}>
                      {DIVISION_NAMES[gIdx]}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {groupTeams.length} Đội
                    </span>
                  </div>

                  {groupTeams.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Chưa có đội nào
                    </span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {groupTeams.map(t => (
                        <div
                          key={t.id}
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.2rem 0.4rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{t.name}</span>
                          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.avgElo}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
