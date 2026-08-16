import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Badge, SkillTierBadge, MemberStatusBadge } from '../common/Badge';
import { MemberFormModal } from './MemberFormModal';
import { useClub } from '../../context/ClubContext';
import { calculatePartnershipChemistry } from '../../utils/eloCalculator';
import { 
  Trophy, 
  Flame, 
  Target, 
  Zap, 
  Calendar, 
  Shield, 
  Award,
  Swords,
  Edit3,
  Trash2
} from 'lucide-react';

export function MemberProfileModal({ member, isOpen, onClose }) {
  const { matches, members, deleteMember, requireAdmin, currentUser } = useClub();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!member) return null;

  const isAdmin = currentUser?.role === 'admin';

  const winRate = member.matchesPlayed > 0 
    ? Math.round((member.wins / member.matchesPlayed) * 100) 
    : 0;

  const avgPoints = member.matchesPlayed > 0 
    ? (member.pointsScored / member.matchesPlayed).toFixed(1) 
    : '0.0';

  const favPartner = member.favoritePartnerId 
    ? members.find(m => m.id === member.favoritePartnerId) 
    : null;

  const playerMatches = matches.filter(m => 
    m.teamA?.player1Id === member.id || 
    m.teamA?.player2Id === member.id || 
    m.teamB?.player1Id === member.id || 
    m.teamB?.player2Id === member.id
  );

  const chemistry = favPartner 
    ? calculatePartnershipChemistry(18, 15)
    : null;

  const handleEditClick = () => {
    requireAdmin(() => {
      setIsEditModalOpen(true);
    });
  };

  const handleDeleteClick = () => {
    requireAdmin(() => {
      const confirmText = `Bạn có chắc chắn muốn xóa hội viên "${member.name}" khỏi danh sách CLB Friends không?`;
      if (window.confirm(confirmText)) {
        deleteMember(member.id);
        onClose();
        alert(`Đã xóa hội viên "${member.name}" thành công.`);
      }
    });
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Hồ Sơ Vận Động Viên & Thống Kê" 
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="btn btn-outline btn-sm"
                  >
                    <Edit3 size={15} />
                    <span>Sửa Thông Tin</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={15} />
                    <span>Xóa VĐV</span>
                  </button>
                </div>
              )}
            </div>

            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Đóng
            </button>
          </div>
        }
      >
        <div>
          {/* Header Profile Section */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <img
                src={member.avatar}
                alt={member.name}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: 'var(--radius-lg)',
                  objectFit: 'cover',
                  border: '3px solid var(--neon-lime)',
                  boxShadow: '0 0 16px rgba(204, 255, 0, 0.3)'
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.45rem', margin: 0 }}>{member.name}</h2>
                  <span style={{ color: 'var(--neon-lime)', fontWeight: '700', fontSize: '1rem' }}>
                    "{member.nickname}"
                  </span>
                  <MemberStatusBadge status={member.status || 'active'} size="sm" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <SkillTierBadge tier={member.tier} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Gia nhập CLB: {member.joinDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Elo & DUPR Callout */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Điểm Elo Bậc Thang
                </span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: 'var(--neon-lime)'
                  }}
                >
                  {member.elo}
                </div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Hệ số DUPR
                </span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: 'var(--neon-cyan)'
                  }}
                >
                  {member.dupr.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Stat Highlights Grid */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Thành Tích Thi Đấu</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '0.2rem' }}>
                {member.wins} Thắng - {member.losses} Thua
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--neon-lime)', fontWeight: '600' }}>
                {winRate}% Tỉ lệ thắng
              </span>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Chuỗi Trận Hiện Tại</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '0.2rem' }}>
                {member.streak > 0 ? `+${member.streak} Thắng 🔥` : `${member.streak} Thua`}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Phong độ gần đây</span>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tổng Điểm Đã Ghi</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '0.2rem' }}>
                {member.pointsScored}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Trung bình {avgPoints} điểm/trận
              </span>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Dòng Vợt Sử Dụng</span>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', marginTop: '0.2rem', color: 'var(--text-primary)' }}>
                {member.paddle}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--neon-cyan)' }}>{member.playStyle}</span>
            </div>
          </div>

          {/* Badges Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.6rem', color: 'var(--text-secondary)' }}>
              Huy Hiệu & Danh Hiệu Đã Đạt Được
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {member.badges && member.badges.length > 0 ? (
                member.badges.map(bId => <Badge key={bId} badgeId={bId} size="md" />)
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Chưa mở khóa huy hiệu đặc biệt. Hãy thi đấu thêm các trận giải và bậc thang!
                </span>
              )}
            </div>
          </div>

          {/* Favorite Partner & Chemistry */}
          {favPartner && chemistry && (
            <div
              style={{
                background: 'rgba(204, 255, 0, 0.04)',
                border: '1px solid rgba(204, 255, 0, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <img
                  src={favPartner.avatar}
                  alt={favPartner.name}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Bạn Đánh Đôi Ưa Thích
                  </span>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                    {favPartner.name} ("{favPartner.nickname}")
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: chemistry.color,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    border: `1px solid ${chemistry.color}40`
                  }}
                >
                  {chemistry.tier}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Điểm Ăn Ý: <strong style={{ color: 'var(--neon-lime)' }}>{chemistry.score}/100</strong>
                </div>
              </div>
            </div>
          )}

          {/* Match History Table */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Lịch Sử Các Trận Đã Đấu ({playerMatches.length})
            </h4>
            {playerMatches.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Chưa có trận đấu nào được ghi nhận cho vận động viên này.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {playerMatches.map(m => {
                  const inTeamA = m.teamA?.player1Id === member.id || m.teamA?.player2Id === member.id;
                  const won = (inTeamA && (m.winnerTeam === 'A' || m.scoreA > m.scoreB)) || 
                              (!inTeamA && (m.winnerTeam === 'B' || m.scoreB > m.scoreA));

                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        background: 'rgba(15, 23, 42, 0.4)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.825rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span
                          style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontWeight: '800',
                            fontSize: '0.7rem',
                            backgroundColor: won ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: won ? '#34d399' : '#f87171'
                          }}
                        >
                          {won ? 'THẮNG' : 'THUA'}
                        </span>
                        <span>
                          <strong>{m.teamA?.name}</strong> vs <strong>{m.teamB?.name}</strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                          {m.scoreA} - {m.scoreB}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                          {m.date.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Embedded Edit Member Modal */}
      <MemberFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        memberToEdit={member}
      />
    </>
  );
}
