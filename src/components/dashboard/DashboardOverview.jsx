import React, { useMemo } from 'react';
import { useClub } from '../../context/ClubContext';
import { StatCard } from '../common/StatCard';
import { TopThreeLeaderboard } from '../rankings/TopThreeLeaderboard';
import { Badge, SkillTierBadge, MemberStatusBadge } from '../common/Badge';
import { 
  Users, 
  Trophy, 
  Swords, 
  Flame, 
  PlusCircle, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export function DashboardOverview() {
  const { 
    members, 
    matches, 
    tournaments, 
    setActiveTab, 
    setIsLogMatchOpen,
    setSelectedPlayer,
    setActiveTournamentId,
    requireAdmin
  } = useClub();

  const sortedMembers = [...members].sort((a, b) => b.elo - a.elo);
  const topPlayer1 = sortedMembers[0];
  const topPlayer2 = sortedMembers[1];
  const topPlayer3 = sortedMembers[2];

  const activeTournament = tournaments.find(t => t.status === 'in-progress') || tournaments[0];
  const recentMatches = matches.slice(0, 5);

  const topDuos = useMemo(() => {
    const pairMap = new Map();
    matches.forEach(m => {
      if (!m.teamA?.player1Id || !m.teamB?.player1Id) return;
      const keyA = [m.teamA.player1Id, m.teamA.player2Id].sort().join('&');
      const isWonA = m.winnerTeam === 'A' || m.scoreA > m.scoreB;
      if (!pairMap.has(keyA)) {
        pairMap.set(keyA, { p1Id: m.teamA.player1Id, p2Id: m.teamA.player2Id, matches: 0, wins: 0 });
      }
      const dataA = pairMap.get(keyA);
      dataA.matches += 1;
      if (isWonA) dataA.wins += 1;

      const keyB = [m.teamB.player1Id, m.teamB.player2Id].sort().join('&');
      if (!pairMap.has(keyB)) {
        pairMap.set(keyB, { p1Id: m.teamB.player1Id, p2Id: m.teamB.player2Id, matches: 0, wins: 0 });
      }
      const dataB = pairMap.get(keyB);
      dataB.matches += 1;
      if (!isWonA) dataB.wins += 1;
    });

    const list = [];
    pairMap.forEach(val => {
      const p1 = members.find(m => m.id === val.p1Id);
      const p2 = members.find(m => m.id === val.p2Id);
      if (p1 && p2) {
        const combinedElo = p1.elo + p2.elo;
        const winRate = val.matches > 0 ? Math.round((val.wins / val.matches) * 100) : 0;
        list.push({
          p1,
          p2,
          name: `${p1.nickname || p1.name.split(' ')[0]} & ${p2.nickname || p2.name.split(' ')[0]}`,
          combinedElo,
          winRate: `${winRate}%`
        });
      }
    });

    if (list.length === 0 && sortedMembers.length >= 4) {
      return [
        {
          p1: sortedMembers[0],
          p2: sortedMembers[1],
          name: `${sortedMembers[0].nickname || sortedMembers[0].name} & ${sortedMembers[1].nickname || sortedMembers[1].name}`,
          combinedElo: sortedMembers[0].elo + sortedMembers[1].elo,
          winRate: '85%'
        },
        {
          p1: sortedMembers[2],
          p2: sortedMembers[3],
          name: `${sortedMembers[2].nickname || sortedMembers[2].name} & ${sortedMembers[3].nickname || sortedMembers[3].name}`,
          combinedElo: sortedMembers[2].elo + sortedMembers[3].elo,
          winRate: '75%'
        }
      ];
    }

    return list.sort((a, b) => b.combinedElo - a.combinedElo).slice(0, 4);
  }, [members, matches, sortedMembers]);

  // Group members count by tier & status for clean breakdown text
  const activeCount = members.filter(m => (m.status || 'active') === 'active').length;
  const pausedCount = members.filter(m => m.status === 'paused').length;
  const leftCount = members.filter(m => m.status === 'left').length;

  const elo1260Count = members.filter(m => m.elo >= 1260).length;
  const elo1150Count = members.filter(m => m.elo < 1260).length;

  return (
    <div className="page-wrapper container">
      {/* Hero Welcome Banner */}
      <div
        className="glass-card"
        style={{
          position: 'relative',
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.7) 100%)',
          border: '1px solid rgba(204, 255, 0, 0.2)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(204, 255, 0, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <span className="status-pill status-live">
              <span className="status-dot"></span>
              Mùa Giải 2026 Đang Diễn Ra
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>• Lịch giao lưu đôi hàng ngày</span>
          </div>

          <h1 style={{ marginBottom: '0.75rem' }}>
            Chào mừng đến với <span className="gradient-text-lime">CLB Pickleball Friends</span>
          </h1>

          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Nền tảng quản lý bảng xếp hạng bậc thang đôi, giải đấu vô địch và phân tích độ ăn ý. Trận thi đấu tiêu chuẩn chạm 15 điểm (cách biệt 2), trận Chung kết tranh cúp thi đấu Bo3 chạm 11 điểm.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              onClick={() => requireAdmin(() => setIsLogMatchOpen(true))}
              className="btn btn-primary"
            >
              <PlusCircle size={18} />
              <span>Ghi Nhận Trận Đôi</span>
            </button>

            <button
              onClick={() => setActiveTab('matchmaker')}
              className="btn btn-cyan"
            >
              <Zap size={18} />
              <span>Ghép Đội Thông Minh</span>
            </button>

            <button
              onClick={() => setActiveTab('tournaments')}
              className="btn btn-outline"
            >
              <Swords size={18} />
              <span>Xem Bảng Đấu Giải</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Tổng Số Hội Viên"
          value={members.length}
          subtitle={`${activeCount} đang hoạt động`}
          icon={Users}
          trend={14}
          color="lime"
        />
        <StatCard
          title="Trận Đã Ghi Nhận"
          value={matches.length}
          subtitle="Trận đôi bậc thang"
          icon={Flame}
          trend={8}
          color="cyan"
        />
        <StatCard
          title="Elo Cặp Đôi Top 1"
          value={topPlayer1 && topPlayer2 ? Math.round((topPlayer1.elo + topPlayer2.elo) / 2) : 1260}
          subtitle={topPlayer1 && topPlayer2 ? `${topPlayer1.nickname || topPlayer1.name} & ${topPlayer2.nickname || topPlayer2.name}` : 'Phạm Linh & Tuấn Anh'}
          icon={Trophy}
          color="gold"
        />
        <StatCard
          title="Giải Đấu CLB"
          value={tournaments.length}
          subtitle="1 giải đang diễn ra"
          icon={Swords}
          color="lime"
        />
      </div>

      {/* 🏆 TOP 3 ELO HONOR LEADERBOARD */}
      <TopThreeLeaderboard title="Bảng Vinh Danh Top 3 Elo CLB Friends" showTitle={true} />

      {/* Member Roster & Skill Breakdown Overview Section (Better Formatted) */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
          border: '1px solid var(--border-medium)'
        }}
      >
        <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} style={{ color: 'var(--neon-lime)' }} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                Tổng Quan Lực Lượng Hội Viên CLB ({members.length} Vận Động Viên)
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Quản lý danh sách thành viên, cập nhật điểm Elo và theo dõi trạng thái sinh hoạt
            </p>
          </div>

          <button
            onClick={() => setActiveTab('members')}
            className="btn btn-outline btn-sm"
          >
            <span>Xem & Quản Lý {members.length} Hội Viên</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Breakdown Badges Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}
        >
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '700', textTransform: 'uppercase' }}>
              🟢 Đang Hoạt Động
            </span>
            <div className="flex-between" style={{ marginTop: '0.2rem' }}>
              <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{activeCount} VĐV</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sinh hoạt thường xuyên</span>
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '700', textTransform: 'uppercase' }}>
              🟡 Tạm Nghỉ
            </span>
            <div className="flex-between" style={{ marginTop: '0.2rem' }}>
              <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{pausedCount} VĐV</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bảo lưu Elo</span>
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(204, 255, 0, 0.08)',
              border: '1px solid rgba(204, 255, 0, 0.25)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--neon-lime)', fontWeight: '700', textTransform: 'uppercase' }}>
              Nhóm Elo 1260
            </span>
            <div className="flex-between" style={{ marginTop: '0.2rem' }}>
              <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{elo1260Count} VĐV</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>3.25 DUPR</span>
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', fontWeight: '700', textTransform: 'uppercase' }}>
              Nhóm Elo 1150
            </span>
            <div className="flex-between" style={{ marginTop: '0.2rem' }}>
              <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{elo1150Count} VĐV</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2.85 DUPR</span>
            </div>
          </div>
        </div>

        {/* Horizontal Mini-Avatar Strip of Active Members */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            overflowX: 'auto',
            padding: '0.5rem 0'
          }}
        >
          {sortedMembers.slice(0, 12).map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedPlayer(m)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'border-color 0.2s ease'
              }}
              className="glass-card-interactive"
            >
              <img
                src={m.avatar}
                alt={m.name}
                style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {m.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--neon-lime)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                {m.elo}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ongoing Tournament Spotlight */}
      {activeTournament && (
        <div
          className="glass-card"
          style={{
            marginBottom: '2rem',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            padding: '1.5rem 2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.2)',
                color: 'var(--neon-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
              }}
            >
              <Swords size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="status-pill status-active">Giải Đang Diễn Ra</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activeTournament.date}</span>
              </div>
              <h3 style={{ marginTop: '0.25rem' }}>{activeTournament.name}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Giải thưởng: <strong style={{ color: '#fbbf24' }}>{activeTournament.prizeTrophy}</strong> • {activeTournament.surface}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTournamentId(activeTournament.id);
              setActiveTab('tournaments');
            }}
            className="btn btn-cyan"
          >
            <span>Vào Bảng Đấu Trực Tiếp</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Two Column Layout: Recent Matches & Top Duos */}
      <div className="grid-2" style={{ gap: '2rem' }}>
        {/* Left Column: Recent Activity Feed */}
        <div className="glass-card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3>Kết Quả Trận Đấu Gần Đây</h3>
              <p style={{ fontSize: '0.85rem' }}>Các trận đôi chính thức tại CLB</p>
            </div>
            <button
              onClick={() => setActiveTab('rankings')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.85rem' }}
            >
              <span>Xem Tất Cả</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentMatches.map((match) => {
              const isTeamAWinner = match.winnerTeam === 'A' || match.scoreA > match.scoreB;
              return (
                <div
                  key={match.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}
                >
                  <div className="flex-between" style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{match.date}</span>
                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        backgroundColor: match.type === 'final' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(204, 255, 0, 0.1)',
                        color: match.type === 'final' ? '#fbbf24' : 'var(--neon-lime)'
                      }}
                    >
                      {match.type === 'final' ? '🏆 Chung Kết (Bo3 chạm 11)' : 'Tiêu Chuẩn (Chạm 15)'}
                    </span>
                  </div>

                  {/* Teams and Score Display */}
                  <div className="flex-between">
                    {/* Team A */}
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div
                        style={{
                          fontWeight: isTeamAWinner ? '700' : '500',
                          color: isTeamAWinner ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: '0.95rem'
                        }}
                      >
                        {match.teamA.name}
                        {isTeamAWinner && <span style={{ color: 'var(--neon-lime)', marginLeft: '0.3rem' }}>✓</span>}
                      </div>
                    </div>

                    {/* Score Center Box */}
                    <div
                      style={{
                        padding: '0.35rem 0.85rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '800',
                        fontSize: '1.05rem',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ color: isTeamAWinner ? 'var(--neon-lime)' : 'var(--text-secondary)' }}>
                        {match.scoreA}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>:</span>
                      <span style={{ color: !isTeamAWinner ? 'var(--neon-lime)' : 'var(--text-secondary)' }}>
                        {match.scoreB}
                      </span>
                    </div>

                    {/* Team B */}
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div
                        style={{
                          fontWeight: !isTeamAWinner ? '700' : '500',
                          color: !isTeamAWinner ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: '0.95rem'
                        }}
                      >
                        {!isTeamAWinner && <span style={{ color: 'var(--neon-lime)', marginRight: '0.3rem' }}>✓</span>}
                        {match.teamB.name}
                      </div>
                    </div>
                  </div>

                  {/* Notes & Elo Delta */}
                  <div className="flex-between" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>{match.notes}</span>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: '600' }}>
                      Elo ±{match.eloDelta || 16}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Top Doubles Partnerships */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div>
                <h3>Cặp Đôi Hàng Đầu</h3>
                <p style={{ fontSize: '0.85rem' }}>Xếp hạng theo tổng điểm Elo & độ ăn ý</p>
              </div>
              <button
                onClick={() => setActiveTab('chemistry')}
                className="btn btn-ghost btn-sm"
              >
                <span>Ma trận ăn ý</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topDuos.map((duo, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: 'var(--radius-md)',
                    border: idx === 0 ? '1px solid rgba(204, 255, 0, 0.3)' : '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: '800',
                        fontSize: '1rem',
                        color: idx === 0 ? 'var(--neon-lime)' : 'var(--text-muted)',
                        width: '24px'
                      }}
                    >
                      #{idx + 1}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', marginRight: '0.2rem' }}>
                      <img
                        src={duo.p1.avatar}
                        alt={duo.p1.name}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: '2px solid var(--bg-app)',
                          objectFit: 'cover'
                        }}
                      />
                      <img
                        src={duo.p2.avatar}
                        alt={duo.p2.name}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: '2px solid var(--bg-app)',
                          marginLeft: '-10px',
                          objectFit: 'cover'
                        }}
                      />
                    </div>

                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{duo.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Tỉ lệ thắng: <strong style={{ color: 'var(--neon-lime)' }}>{duo.winRate}</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {duo.combinedElo} Elo
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      TB {Math.round(duo.combinedElo / 2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Matchmaker Callout Card */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', marginBottom: '0.2rem' }}>
                <Sparkles size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
                  Cân Bằng Đội Hình Trên Sân
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Có 4 người trên sân? Tự động phân chia 2 cặp đôi có mức chênh lệch Elo nhỏ nhất để trận đấu cân tài cân sức.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('matchmaker')}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: 'rgba(139, 92, 246, 0.5)', color: '#c084fc' }}
            >
              <span>Ghép Đội Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
