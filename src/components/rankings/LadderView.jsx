import React, { useState, useMemo } from 'react';
import { useClub } from '../../context/ClubContext';
import { LogMatchModal } from './LogMatchModal';
import { HeadToHeadModal } from './HeadToHeadModal';
import { MemberProfileModal } from '../members/MemberProfileModal';
import { TopThreeLeaderboard } from './TopThreeLeaderboard';
import { SkillTierBadge } from '../common/Badge';
import { calculatePartnershipChemistry } from '../../utils/eloCalculator';
import { 
  Trophy, 
  Users, 
  Swords, 
  PlusCircle, 
  ChevronRight, 
  Search,
  Sparkles
} from 'lucide-react';

export function LadderView() {
  const { 
    members, 
    matches, 
    isLogMatchOpen, 
    setIsLogMatchOpen,
    isHeadToHeadOpen,
    setIsHeadToHeadOpen,
    selectedPlayer,
    setSelectedPlayer,
    requireAdmin
  } = useClub();

  const [rankingTab, setRankingTab] = useState('individual');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogMatchClick = () => {
    requireAdmin(() => {
      setIsLogMatchOpen(true);
    });
  };

  const individualRankings = useMemo(() => {
    return [...members]
      .filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.nickname.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.elo - a.elo);
  }, [members, searchQuery]);

  const doublesRankings = useMemo(() => {
    const pairMap = new Map();

    matches.forEach(m => {
      const keyA = [m.teamA.player1Id, m.teamA.player2Id].sort().join('&');
      const keyB = [m.teamB.player1Id, m.teamB.player2Id].sort().join('&');

      const isWonA = m.winnerTeam === 'A' || m.scoreA > m.scoreB;

      if (!pairMap.has(keyA)) {
        pairMap.set(keyA, {
          p1Id: m.teamA.player1Id,
          p2Id: m.teamA.player2Id,
          matches: 0,
          wins: 0
        });
      }
      const dataA = pairMap.get(keyA);
      dataA.matches += 1;
      if (isWonA) dataA.wins += 1;

      if (!pairMap.has(keyB)) {
        pairMap.set(keyB, {
          p1Id: m.teamB.player1Id,
          p2Id: m.teamB.player2Id,
          matches: 0,
          wins: 0
        });
      }
      const dataB = pairMap.get(keyB);
      dataB.matches += 1;
      if (!isWonA) dataB.wins += 1;
    });

    const pairsList = [];
    pairMap.forEach((val, key) => {
      const p1 = members.find(m => m.id === val.p1Id);
      const p2 = members.find(m => m.id === val.p2Id);

      if (p1 && p2) {
        const combinedElo = p1.elo + p2.elo;
        const avgElo = Math.round(combinedElo / 2);
        const winRate = val.matches > 0 ? Math.round((val.wins / val.matches) * 100) : 0;
        const chemistry = calculatePartnershipChemistry(val.matches, val.wins);

        pairsList.push({
          id: key,
          p1,
          p2,
          name: `${p1.name.split(' ')[0]} & ${p2.name.split(' ')[0]}`,
          nicknames: `"${p1.nickname}" & "${p2.nickname}"`,
          combinedElo,
          avgElo,
          matches: val.matches,
          wins: val.wins,
          losses: val.matches - val.wins,
          winRate,
          chemistry
        });
      }
    });

    return pairsList.sort((a, b) => b.combinedElo - a.combinedElo);
  }, [matches, members]);

  return (
    <div className="page-wrapper container">
      {/* Header Bar */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Bảng Xếp Hạng & Bậc Thang Đôi</h1>
          <p style={{ fontSize: '0.95rem' }}>
            Hệ thống Elo động được cập nhật tự động sau mỗi trận tiêu chuẩn (chạm 15) và trận chung kết (Bo3 chạm 11).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsHeadToHeadOpen(true)}
            className="btn btn-secondary"
          >
            <Swords size={17} />
            <span>Đối Đầu Trực Tiếp</span>
          </button>

          <button
            onClick={handleLogMatchClick}
            className="btn btn-primary"
          >
            <PlusCircle size={17} />
            <span>Ghi Nhận Trận Đấu</span>
          </button>
        </div>
      </div>

      {/* 🏆 TOP 3 ELO HONOR LEADERBOARD PODIUM */}
      {rankingTab === 'individual' && !searchQuery && (
        <TopThreeLeaderboard title="Bảng Vinh Danh Top 3 Elo CLB Friends" showTitle={true} />
      )}

      {/* Tabs & Search Controls */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        {/* Sub-tab Pill Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '0.3rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <button
            onClick={() => setRankingTab('individual')}
            className={`btn btn-sm ${rankingTab === 'individual' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Trophy size={16} />
            <span>Bậc Thang Cá Nhân ({individualRankings.length})</span>
          </button>

          <button
            onClick={() => setRankingTab('doubles')}
            className={`btn btn-sm ${rankingTab === 'doubles' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Users size={16} />
            <span>Xếp Hạng Cặp Đôi ({doublesRankings.length})</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm người chơi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem', padding: '0.5rem 0.85rem 0.5rem 2.4rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Tab 1: Individual Ladder Table */}
      {rankingTab === 'individual' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  <th style={{ padding: '1rem 1.25rem' }}>Thứ Hạng</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Vận Động Viên</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Phân Hạng</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Điểm Elo</th>
                  <th style={{ padding: '1rem 1.25rem' }}>DUPR</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Thành Tích (T-B)</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Tỉ Lệ Thắng</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Phong Độ</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Chi Tiết</th>
                </tr>
              </thead>
              <tbody>
                {individualRankings.map((player, idx) => {
                  const winRate = player.matchesPlayed > 0 
                    ? Math.round((player.wins / player.matchesPlayed) * 100) 
                    : 0;

                  return (
                    <tr
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: '800',
                            fontSize: '1rem',
                            color: idx === 0 ? '#fbbf24' : idx === 1 ? '#06b6d4' : idx === 2 ? '#f97316' : 'var(--text-muted)'
                          }}
                        >
                          {idx === 0 ? '👑 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img
                            src={player.avatar}
                            alt={player.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: 'var(--radius-md)',
                              objectFit: 'cover'
                            }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--text-primary)' }}>
                              {player.name}
                            </strong>
                            <span style={{ fontSize: '0.78rem', color: 'var(--neon-lime)', fontWeight: '600' }}>
                              "{player.nickname}"
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <SkillTierBadge tier={player.tier} />
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: '800',
                            fontSize: '1.1rem',
                            color: 'var(--neon-lime)'
                          }}
                        >
                          {player.elo}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--neon-cyan)' }}>
                          {player.dupr.toFixed(2)}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontWeight: '600' }}>
                          {player.wins}T - {player.losses}B
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {player.matchesPlayed} trận đã đấu
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem', width: '38px' }}>
                            {winRate}%
                          </span>
                          <div
                            style={{
                              width: '60px',
                              height: '5px',
                              borderRadius: '9999px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              overflow: 'hidden'
                            }}
                          >
                            <div
                              style={{
                                width: `${winRate}%`,
                                height: '100%',
                                background: winRate >= 70 ? 'var(--neon-lime)' : 'var(--neon-cyan)'
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        {player.streak >= 3 ? (
                          <span className="badge-gold" style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                            🔥 {player.streak} T
                          </span>
                        ) : player.streak > 0 ? (
                          <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: '600' }}>
                            +{player.streak} T
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {player.streak} B
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Doubles Partnerships Leaderboard */}
      {rankingTab === 'doubles' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  <th style={{ padding: '1rem 1.25rem' }}>Thứ Hạng</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Cặp Đôi Thi Đấu</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Tổng Elo Cặp</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Elo Trung Bình</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Thành Tích (T-B)</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Tỉ Lệ Thắng</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Cấp Độ Ăn Ý</th>
                </tr>
              </thead>
              <tbody>
                {doublesRankings.map((duo, idx) => (
                  <tr
                    key={duo.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: '800',
                          fontSize: '1rem',
                          color: idx === 0 ? '#fbbf24' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#d97706' : 'var(--text-muted)'
                        }}
                      >
                        {idx === 0 ? '👑 #1' : `#${idx + 1}`}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={duo.p1.avatar}
                            alt={duo.p1.name}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              border: '2px solid var(--bg-app)',
                              objectFit: 'cover'
                            }}
                          />
                          <img
                            src={duo.p2.avatar}
                            alt={duo.p2.name}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              border: '2px solid var(--bg-app)',
                              marginLeft: '-12px',
                              objectFit: 'cover'
                            }}
                          />
                        </div>

                        <div>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block' }}>
                            {duo.name}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {duo.nicknames}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '800',
                          fontSize: '1.05rem',
                          color: 'var(--neon-lime)'
                        }}
                      >
                        {duo.combinedElo}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {duo.avgElo}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontWeight: '600' }}>
                        {duo.wins}T - {duo.losses}B
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {duo.matches} trận cùng nhau
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontWeight: '700', color: duo.winRate >= 70 ? 'var(--neon-lime)' : 'var(--text-primary)' }}>
                        {duo.winRate}%
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          color: duo.chemistry.color,
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          border: `1px solid ${duo.chemistry.color}40`
                        }}
                      >
                        {duo.chemistry.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <LogMatchModal
        isOpen={isLogMatchOpen}
        onClose={() => setIsLogMatchOpen(false)}
      />

      <HeadToHeadModal
        isOpen={isHeadToHeadOpen}
        onClose={() => setIsHeadToHeadOpen(false)}
      />

      <MemberProfileModal
        member={selectedPlayer}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
}
