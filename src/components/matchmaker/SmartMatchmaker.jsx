import React, { useState, useMemo } from 'react';
import { useClub } from '../../context/ClubContext';
import { LogMatchModal } from '../rankings/LogMatchModal';
import { Zap, Sparkles, Play, Shuffle } from 'lucide-react';

export function SmartMatchmaker() {
  const { members, requireAdmin } = useClub();

  const [selectedIds, setSelectedIds] = useState(['p-1', 'p-3', 'p-5', 'p-7']);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [launchPlayers, setLaunchPlayers] = useState(null);

  const toggleSelectPlayer = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      if (selectedIds.length >= 4) {
        setSelectedIds([...selectedIds.slice(1), id]);
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const selectedPlayers = useMemo(() => {
    return selectedIds.map(id => members.find(m => m.id === id)).filter(Boolean);
  }, [selectedIds, members]);

  const combinations = useMemo(() => {
    if (selectedPlayers.length !== 4) return [];

    const [p1, p2, p3, p4] = selectedPlayers;

    const combos = [
      {
        id: 1,
        teamA: [p1, p2],
        teamB: [p3, p4],
        avgEloA: Math.round((p1.elo + p2.elo) / 2),
        avgEloB: Math.round((p3.elo + p4.elo) / 2),
        eloDelta: Math.abs(Math.round((p1.elo + p2.elo) / 2) - Math.round((p3.elo + p4.elo) / 2))
      },
      {
        id: 2,
        teamA: [p1, p3],
        teamB: [p2, p4],
        avgEloA: Math.round((p1.elo + p3.elo) / 2),
        avgEloB: Math.round((p2.elo + p4.elo) / 2),
        eloDelta: Math.abs(Math.round((p1.elo + p3.elo) / 2) - Math.round((p2.elo + p4.elo) / 2))
      },
      {
        id: 3,
        teamA: [p1, p4],
        teamB: [p2, p3],
        avgEloA: Math.round((p1.elo + p4.elo) / 2),
        avgEloB: Math.round((p2.elo + p3.elo) / 2),
        eloDelta: Math.abs(Math.round((p1.elo + p4.elo) / 2) - Math.round((p2.elo + p3.elo) / 2))
      }
    ];

    return combos.sort((a, b) => a.eloDelta - b.eloDelta);
  }, [selectedPlayers]);

  const handleLaunchMatch = (combo) => {
    requireAdmin(() => {
      setLaunchPlayers([
        combo.teamA[0].id,
        combo.teamA[1].id,
        combo.teamB[0].id,
        combo.teamB[1].id
      ]);
      setIsLogModalOpen(true);
    });
  };

  return (
    <div className="page-wrapper container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <Zap size={28} style={{ color: 'var(--neon-lime)' }} />
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Ghép Đội Đôi Cân Bằng Thông Minh</h1>
        </div>
        <p style={{ fontSize: '0.95rem' }}>
          Chọn 4 vận động viên trên sân. Thuật toán sẽ tính toán các hoán vị để đưa ra cặp đấu có mức chênh lệch điểm Elo thấp nhất.
        </p>
      </div>

      {/* Step 1: Select 4 Players */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h3>Bước 1: Chọn 4 Người Chơi Đang Có Mặt Trên Sân</h3>
            <p style={{ fontSize: '0.85rem' }}>
              Đã chọn: <strong style={{ color: 'var(--neon-lime)' }}>{selectedPlayers.length}/4 Người</strong>
            </p>
          </div>

          <button
            onClick={() => {
              const shuffled = [...members].sort(() => 0.5 - Math.random());
              setSelectedIds(shuffled.slice(0, 4).map(m => m.id));
            }}
            className="btn btn-secondary btn-sm"
          >
            <Shuffle size={16} />
            <span>Chọn Ngẫu Nhiên 4 Người</span>
          </button>
        </div>

        {/* Player Chips Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '0.75rem'
          }}
        >
          {members.map(member => {
            const isSelected = selectedIds.includes(member.id);
            return (
              <div
                key={member.id}
                onClick={() => toggleSelectPlayer(member.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--border-lime)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(204, 255, 0, 0.12)' : 'rgba(15, 23, 42, 0.5)',
                  boxShadow: isSelected ? '0 0 14px rgba(204, 255, 0, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: isSelected ? '700' : '500', fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {member.elo} Elo • {member.playStyle}
                  </div>
                </div>

                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isSelected ? 'none' : '1px solid var(--border-medium)',
                    backgroundColor: isSelected ? 'var(--neon-lime)' : 'transparent',
                    color: '#070a11',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '800'
                  }}
                >
                  {isSelected && '✓'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Optimal Pairing Results */}
      {combinations.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Bước 2: Các Phương Án Chia Cặp Đấu</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {combinations.map((combo, idx) => {
              const isBest = idx === 0;
              return (
                <div
                  key={combo.id}
                  className="glass-card"
                  style={{
                    border: isBest ? '1px solid rgba(204, 255, 0, 0.5)' : '1px solid var(--border-subtle)',
                    background: isBest ? 'linear-gradient(135deg, rgba(204, 255, 0, 0.08) 0%, rgba(15, 23, 42, 0.85) 100%)' : 'var(--bg-card)',
                    padding: '1.5rem',
                    position: 'relative'
                  }}
                >
                  {isBest && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1.25rem',
                        backgroundColor: 'rgba(204, 255, 0, 0.15)',
                        border: '1px solid var(--border-lime)',
                        color: 'var(--neon-lime)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Sparkles size={14} />
                      <span>Cân Bằng Nhất (Chênh lệch Elo: {combo.eloDelta})</span>
                    </div>
                  )}

                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                      Phương Án #{combo.id} {isBest ? '• Khuyên Dùng Tối Ưu' : ''}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.5rem'
                    }}
                  >
                    {/* Team A */}
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--neon-lime)', fontWeight: '800' }}>
                        ĐỘI 1 (Elo TB: {combo.avgEloA})
                      </span>
                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
                        {combo.teamA.map(p => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img src={p.avatar} alt={p.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <strong style={{ fontSize: '0.85rem', display: 'block' }}>{p.name}</strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.elo} Elo</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* VS divider */}
                    <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                      <div style={{ fontWeight: '900', color: 'var(--text-muted)', fontSize: '1.1rem' }}>VS</div>
                      <div style={{ fontSize: '0.75rem', color: isBest ? 'var(--neon-lime)' : 'var(--text-muted)' }}>
                        Δ {combo.eloDelta} Elo
                      </div>
                    </div>

                    {/* Team B */}
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--neon-cyan)', fontWeight: '800' }}>
                        ĐỘI 2 (Elo TB: {combo.avgEloB})
                      </span>
                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
                        {combo.teamB.map(p => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img src={p.avatar} alt={p.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <strong style={{ fontSize: '0.85rem', display: 'block' }}>{p.name}</strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.elo} Elo</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Launch Match Button */}
                    <div>
                      <button
                        onClick={() => handleLaunchMatch(combo)}
                        className={`btn ${isBest ? 'btn-primary' : 'btn-outline'}`}
                      >
                        <Play size={16} />
                        <span>Thi Đấu Trận Này</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isLogModalOpen && launchPlayers && (
        <LogMatchModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          prefilledPlayers={launchPlayers}
        />
      )}
    </div>
  );
}
