import React, { useState, useMemo } from 'react';
import { useClub } from '../../context/ClubContext';
import { Badge, SkillTierBadge, MemberStatusBadge } from '../common/Badge';
import { MemberProfileModal } from './MemberProfileModal';
import { MemberFormModal } from './MemberFormModal';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Trophy, 
  Flame, 
  ChevronRight,
  TrendingUp,
  Edit3,
  Trash2,
  ShieldAlert
} from 'lucide-react';

export function MemberList() {
  const { 
    members, 
    selectedPlayer, 
    setSelectedPlayer,
    deleteMember,
    requireAdmin,
    currentUser
  } = useClub();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'paused' | 'left'
  const [sortBy, setSortBy] = useState('elo-desc');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);

  const isAdmin = currentUser?.role === 'admin';

  const handleAddMemberClick = () => {
    requireAdmin(() => {
      setMemberToEdit(null);
      setIsAddMemberOpen(true);
    });
  };

  const handleEditMemberClick = (e, member) => {
    e.stopPropagation();
    requireAdmin(() => {
      setMemberToEdit(member);
      setIsAddMemberOpen(true);
    });
  };

  const handleDeleteMemberClick = (e, member) => {
    e.stopPropagation();
    requireAdmin(() => {
      const confirmText = `Bạn có chắc chắn muốn xóa hội viên "${member.name}" khỏi danh sách CLB Friends không?`;
      if (window.confirm(confirmText)) {
        deleteMember(member.id);
        alert(`Đã xóa hội viên "${member.name}" thành công.`);
      }
    });
  };

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        const matchesSearch =
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.paddle.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTier = tierFilter === 'all' || m.tier === tierFilter;
        const matchesStatus = statusFilter === 'all' || (m.status || 'active') === statusFilter;

        return matchesSearch && matchesTier && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'elo-desc') return b.elo - a.elo;
        if (sortBy === 'elo-asc') return a.elo - b.elo;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'vi');
        if (sortBy === 'matches-desc') return b.matchesPlayed - a.matchesPlayed;
        return 0;
      });
  }, [members, searchQuery, tierFilter, statusFilter, sortBy]);

  // Counts for status pills
  const activeCount = members.filter(m => (m.status || 'active') === 'active').length;
  const pausedCount = members.filter(m => m.status === 'paused').length;
  const leftCount = members.filter(m => m.status === 'left').length;

  return (
    <div className="page-wrapper container">
      {/* Header Bar */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Danh Sách Hội Viên CLB Friends</h1>
          <p style={{ fontSize: '0.95rem' }}>
            Quản lý {members.length} hội viên: theo dõi trạng thái hoạt động, điểm Elo, phân hạng và lịch sử thi đấu.
          </p>
        </div>

        <button
          onClick={handleAddMemberClick}
          className="btn btn-primary"
        >
          <UserPlus size={18} />
          <span>Thêm Thành Viên Mới</span>
        </button>
      </div>

      {/* Filter & Controls Card */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {/* Row 1: Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '0.25rem'
            }}
          >
            <button
              onClick={() => setStatusFilter('all')}
              className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            >
              Tất Cả ({members.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`btn btn-sm ${statusFilter === 'active' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            >
              🟢 Hoạt Động ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('paused')}
              className={`btn btn-sm ${statusFilter === 'paused' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            >
              🟡 Tạm Nghỉ ({pausedCount})
            </button>
            <button
              onClick={() => setStatusFilter('left')}
              className={`btn btn-sm ${statusFilter === 'left' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            >
              ⚪ Rời CLB ({leftCount})
            </button>
          </div>

          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Hiển thị: <strong style={{ color: 'var(--text-primary)' }}>{filteredMembers.length}</strong> / {members.length} Hội viên
          </span>
        </div>

        {/* Row 2: Search and Select Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
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
              placeholder="Tìm kiếm theo tên, biệt danh, vợt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '170px', fontSize: '0.82rem' }}
            >
              <option value="all">Tất cả phân hạng</option>
              <option value="Cao thủ / Chuyên nghiệp">Cao thủ / Chuyên nghiệp</option>
              <option value="Nâng cao">Nâng cao</option>
              <option value="Trung cấp+">Trung cấp+</option>
              <option value="Trung cấp">Trung cấp</option>
              <option value="Tiềm năng">Tiềm năng</option>
              <option value="Mới bắt đầu">Mới bắt đầu</option>
            </select>

            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', minWidth: '160px', fontSize: '0.82rem' }}
            >
              <option value="elo-desc">Elo: Cao ➔ Thấp</option>
              <option value="elo-asc">Elo: Thấp ➔ Cao</option>
              <option value="name-asc">Tên: A ➔ Z</option>
              <option value="matches-desc">Số trận thi đấu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid Cards */}
      <div className="grid-3" style={{ gap: '1.25rem' }}>
        {filteredMembers.map((member, idx) => {
          const winRate = member.matchesPlayed > 0 
            ? Math.round((member.wins / member.matchesPlayed) * 100) 
            : 0;

          return (
            <div
              key={member.id}
              onClick={() => setSelectedPlayer(member)}
              className="glass-card glass-card-interactive"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {/* Card Top: Avatar, Names, Status, Admin Actions */}
              <div>
                <div className="flex-between" style={{ marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'cover',
                          border: '2px solid var(--border-medium)'
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-4px',
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          backgroundColor: 'var(--bg-card)',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)'
                        }}
                      >
                        #{idx + 1}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {member.name}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--neon-lime)', fontWeight: '600' }}>
                        "{member.nickname}"
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <MemberStatusBadge status={member.status || 'active'} size="sm" />
                </div>

                {/* Badges & Tier Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                  <SkillTierBadge tier={member.tier} />
                  {member.badges?.slice(0, 2).map((bId) => (
                    <Badge key={bId} badgeId={bId} size="sm" />
                  ))}
                </div>

                {/* Rating & Stats Strip */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.85rem'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Điểm Elo
                    </span>
                    <strong
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.1rem',
                        color: 'var(--neon-lime)'
                      }}
                    >
                      {member.elo}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      DUPR
                    </span>
                    <strong
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1rem',
                        color: 'var(--neon-cyan)'
                      }}
                    >
                      {member.dupr.toFixed(2)}
                    </strong>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Tỉ lệ thắng
                    </span>
                    <strong style={{ fontSize: '0.95rem', color: winRate >= 60 ? 'var(--neon-lime)' : 'var(--text-primary)' }}>
                      {winRate}% ({member.wins}T-{member.losses}B)
                    </strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sở trường:</span> {member.playStyle}
                </div>
              </div>

              {/* Card Footer: Details & Admin Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.65rem',
                  marginTop: '0.5rem'
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Vợt: {member.paddle}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {/* Admin Edit & Delete Actions */}
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => handleEditMemberClick(e, member)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.25rem 0.45rem', color: 'var(--neon-cyan)' }}
                        title="Chỉnh sửa thông tin thành viên"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteMemberClick(e, member)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.25rem 0.45rem', color: '#f87171' }}
                        title="Xóa thành viên khỏi CLB"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}

                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Form Modal (Add & Edit) */}
      <MemberFormModal
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setMemberToEdit(null);
        }}
        memberToEdit={memberToEdit}
      />

      {/* Member Profile Modal */}
      <MemberProfileModal
        member={selectedPlayer}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
}
