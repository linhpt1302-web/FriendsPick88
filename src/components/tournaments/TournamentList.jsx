import React, { useState, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import { GroupStageView } from './GroupStageView';
import { SingleEliminationBracket } from './SingleEliminationBracket';
import { CreateTournamentModal } from './CreateTournamentModal';
import { ChampionPodium } from './ChampionPodium';
import { 
  PlusCircle, 
  Trash2, 
  Layers, 
  Swords, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Sparkles,
  BarChart3,
  AlertTriangle,
  Zap
} from 'lucide-react';

export function TournamentList() {
  const { 
    members,
    tournaments, 
    isCreateTournamentOpen, 
    setIsCreateTournamentOpen,
    activeTournamentId,
    setActiveTournamentId,
    deleteTournament,
    createTournament,
    requireAdmin
  } = useClub();

  const [selectedTourneyId, setSelectedTourneyId] = useState(
    activeTournamentId || tournaments[0]?.id || ''
  );

  const [stageTab, setStageTab] = useState('groups'); // 'groups' | 'knockout' | 'podium'

  // Sync selectedTourneyId when tournaments change or new tournament created
  useEffect(() => {
    if (activeTournamentId && tournaments.some(t => t.id === activeTournamentId)) {
      setSelectedTourneyId(activeTournamentId);
    } else if (tournaments.length > 0) {
      if (!selectedTourneyId || !tournaments.some(t => t.id === selectedTourneyId)) {
        setSelectedTourneyId(tournaments[0].id);
        setActiveTournamentId(tournaments[0].id);
      }
    } else {
      setSelectedTourneyId('');
    }
  }, [activeTournamentId, tournaments]);

  const currentTournament = tournaments.find(t => t.id === selectedTourneyId) || tournaments[0];

  const handleCreateClick = () => {
    requireAdmin(() => {
      setIsCreateTournamentOpen(true);
    });
  };

  /**
   * 1-Click Quick Sample Tournament Generator for fast setup
   */
  const handleQuickCreateSampleTourney = () => {
    requireAdmin(() => {
      const sorted = [...members].sort((a, b) => b.elo - a.elo);
      const quickTeams = [];

      for (let i = 0; i < 8; i++) {
        const p1 = sorted[(i * 2) % sorted.length];
        const p2 = sorted[(i * 2 + 1) % sorted.length];
        const groupCodes = ['A', 'B', 'C', 'D'];
        quickTeams.push({
          id: `team-sample-${i + 1}`,
          name: `${p1.nickname || p1.name.split(' ')[0]} & ${p2.nickname || p2.name.split(' ')[0]}`,
          playerIds: [p1.id, p2.id],
          groupCode: groupCodes[Math.floor(i / 2)],
          avgElo: Math.round((p1.elo + p2.elo) / 2)
        });
      }

      const created = createTournament({
        name: `Giải Đôi Vô Địch CLB Friends 2026`,
        surface: 'Sân Trung tâm 1 & 2',
        prizeTrophy: 'Cúp Vàng Vô Địch & Cặp Vợt Selkirk Pro 🏆',
        description: 'Giải đấu đôi đỉnh cao 4 bảng đấu (A, B, C, D), top 2 mỗi bảng vào Tứ kết loại trực tiếp đến Chung kết Bo3.',
        date: `Tháng ${new Date().getMonth() + 1}, ${new Date().getFullYear()}`,
        teams: quickTeams,
        numGroups: 4
      });

      if (created) {
        setActiveTournamentId(created.id);
        setSelectedTourneyId(created.id);
        alert(`Đã khởi tạo thành công giải đấu mẫu "${created.name}" gồm 4 bảng (8 đội đôi)!`);
      }
    });
  };

  const handleDeleteTournament = () => {
    if (!currentTournament) return;

    requireAdmin(() => {
      const confirmText = `Bạn có chắc chắn muốn xóa giải đấu "${currentTournament.name}"?\n\n⚠️ LƯU Ý: Toàn bộ điểm Elo và kết quả trận đấu trong giải này sẽ được hoàn trả lại như trước khi giải diễn ra.`;
      if (window.confirm(confirmText)) {
        deleteTournament(currentTournament.id);
        alert(`Đã xóa giải đấu "${currentTournament.name}" và hoàn trả điểm Elo cho các VĐV thành công!`);
        if (tournaments.length > 1) {
          const next = tournaments.find(t => t.id !== currentTournament.id);
          setSelectedTourneyId(next?.id || '');
          setActiveTournamentId(next?.id || null);
        } else {
          setSelectedTourneyId('');
          setActiveTournamentId(null);
        }
      }
    });
  };

  // Calculate tournament progress
  let totalMatches = 0;
  let completedMatches = 0;

  if (currentTournament) {
    if (currentTournament.groups) {
      currentTournament.groups.forEach(g => {
        g.matches.forEach(m => {
          totalMatches++;
          if (m.status === 'completed') completedMatches++;
        });
      });
    }

    if (currentTournament.bracket) {
      currentTournament.bracket.rounds.forEach(r => {
        r.matches.forEach(m => {
          totalMatches++;
          if (m.status === 'completed') completedMatches++;
        });
      });
    }
  }

  const progressPercent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
  const isChampionCrown = Boolean(currentTournament?.bracket?.champion);

  return (
    <div className="page-wrapper container">
      {/* Header Bar */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Giải Đấu CLB Friends</h1>
          <p style={{ fontSize: '0.95rem' }}>
            Hệ thống giải đấu toàn diện: Vòng bảng tính điểm ➔ Vòng Tứ kết loại trực tiếp ➔ Chung kết Bo3 & Tự động cập nhật Elo.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleQuickCreateSampleTourney}
            className="btn btn-secondary"
          >
            <Zap size={16} style={{ color: 'var(--neon-cyan)' }} />
            <span>Tạo Nhanh 4 Bảng (8 Đôi)</span>
          </button>

          <button
            onClick={handleCreateClick}
            className="btn btn-primary"
          >
            <PlusCircle size={18} />
            <span>Tạo Giải Đấu Tùy Chỉnh</span>
          </button>
        </div>
      </div>

      {/* Tournament Selector Strip */}
      {tournaments.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
            border: '1px dashed var(--border-medium)',
            marginBottom: '2rem'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(204, 255, 0, 0.1)',
              color: 'var(--neon-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <Trophy size={32} />
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Chưa Có Giải Đấu Nào Được Khởi Tạo</h3>
          <p style={{ maxWidth: '560px', margin: '0 auto 1.75rem auto', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Hệ thống đã sẵn sàng với 29 hội viên CLB. Bạn có thể tạo nhanh một giải đấu vô địch 4 bảng hoặc tự do cấu hình từ 1-30 đội và 1-10 bảng đấu.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleQuickCreateSampleTourney}
              className="btn btn-primary btn-lg"
              style={{ fontWeight: '700' }}
            >
              <Zap size={18} />
              <span>Khởi Tạo Nhanh Giải Mẫu 4 Bảng (8 Đôi)</span>
            </button>

            <button
              onClick={handleCreateClick}
              className="btn btn-secondary btn-lg"
            >
              <PlusCircle size={18} />
              <span>Tạo & Ghép Bảng Thủ Công</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            marginBottom: '1.75rem'
          }}
        >
          {tournaments.map((t) => {
            const isSelected = t.id === currentTournament?.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTourneyId(t.id);
                  setActiveTournamentId(t.id);
                }}
                className="glass-card"
                style={{
                  padding: '1rem 1.25rem',
                  minWidth: '280px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--border-lime)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(204, 255, 0, 0.08)' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 0 20px rgba(204, 255, 0, 0.2)' : 'var(--shadow-sm)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontWeight: '700',
                      color: t.status === 'in-progress' ? 'var(--neon-lime)' : t.status === 'completed' ? '#34d399' : '#fbbf24'
                    }}
                  >
                    {t.status === 'in-progress' ? '● Đang Diễn Ra' : t.status === 'completed' ? '✓ Đã Kết Thúc' : '🗓️ Sắp Tới'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{t.date}</span>
                </div>
                <strong style={{ fontSize: '1rem', display: 'block', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {t.name}
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {t.numGroups || t.groups?.length || 4} Bảng Đấu ➔ Tứ Kết ➔ Chung Kết Bo3
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Tournament Detail View */}
      {currentTournament && (
        <div>
          {/* Tournament Overview Card */}
          <div
            className="glass-card"
            style={{
              padding: '1.5rem',
              marginBottom: '1.75rem',
              border: '1px solid var(--border-medium)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%)'
            }}
          >
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{currentTournament.name}</h2>
                  {currentTournament.status === 'completed' ? (
                    <span className="status-pill" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #34d399' }}>
                      Đã Hoàn Thành
                    </span>
                  ) : (
                    <span className="status-pill status-live">Trực Tiếp</span>
                  )}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {currentTournament.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    GIẢI THƯỞNG
                  </span>
                  <strong style={{ color: '#fbbf24', fontSize: '0.95rem' }}>{currentTournament.prizeTrophy}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    SÂN ĐẤU
                  </span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{currentTournament.surface}</strong>
                </div>

                {/* Delete Tournament Action */}
                <button
                  onClick={handleDeleteTournament}
                  className="btn btn-danger btn-sm"
                  style={{ marginLeft: '0.5rem' }}
                  title="Xóa giải đấu và hoàn trả điểm Elo"
                >
                  <Trash2 size={15} />
                  <span>Xóa Giải Đấu</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Tiến độ giải đấu: <strong style={{ color: 'var(--text-primary)' }}>{completedMatches}/{totalMatches} Trận đấu ({progressPercent}%)</strong>
                </span>
                <span style={{ color: 'var(--neon-lime)', fontWeight: '700' }}>
                  {isChampionCrown ? '🏆 Đã tìm ra Nhà Vô Địch!' : '⚡ Đang cập nhật điểm Elo tự động'}
                </span>
              </div>
              <div
                style={{
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    backgroundColor: progressPercent === 100 ? '#34d399' : 'var(--neon-lime)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stage Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '2rem',
              flexWrap: 'wrap'
            }}
          >
            <button
              onClick={() => setStageTab('groups')}
              className={`btn ${stageTab === 'groups' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <BarChart3 size={17} />
              <span>1. Vòng Bảng ({currentTournament.groups?.length || 4} Bảng Đấu)</span>
            </button>

            <button
              onClick={() => setStageTab('knockout')}
              className={`btn ${stageTab === 'knockout' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Swords size={17} />
              <span>2. Vòng Loại Trực Tiếp (Tứ Kết ➔ Chung Kết)</span>
            </button>

            {isChampionCrown && (
              <button
                onClick={() => setStageTab('podium')}
                className={`btn ${stageTab === 'podium' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  borderColor: stageTab === 'podium' ? 'transparent' : 'rgba(245, 158, 11, 0.4)',
                  color: stageTab === 'podium' ? '#000' : '#fbbf24'
                }}
              >
                <Trophy size={17} />
                <span>3. Bục Vô Địch</span>
              </button>
            )}
          </div>

          {/* Active View Display */}
          {stageTab === 'groups' && (
            <GroupStageView 
              tournament={currentTournament} 
              onNavigateToKnockout={() => setStageTab('knockout')}
            />
          )}

          {stageTab === 'knockout' && (
            <SingleEliminationBracket tournament={currentTournament} />
          )}

          {stageTab === 'podium' && isChampionCrown && (
            <ChampionPodium
              champion={currentTournament.bracket.champion}
              tournamentName={currentTournament.name}
              prizeTrophy={currentTournament.prizeTrophy}
            />
          )}
        </div>
      )}

      <CreateTournamentModal
        isOpen={isCreateTournamentOpen}
        onClose={() => setIsCreateTournamentOpen(false)}
      />
    </div>
  );
}
