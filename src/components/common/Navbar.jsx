import React from 'react';
import { useClub } from '../../context/ClubContext';
import { ClubLogo } from './ClubLogo';
import { 
  Trophy, 
  Users, 
  Swords, 
  Zap, 
  Flame, 
  LayoutDashboard, 
  Shield, 
  User,
  LogOut,
  Database,
  PlusCircle
} from 'lucide-react';

export function Navbar() {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    logout,
    setIsAuthModalOpen,
    setIsLogMatchOpen, 
    setIsDataManagementOpen 
  } = useClub();

  const navItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'members', label: 'Thành Viên', icon: Users },
    { id: 'rankings', label: 'Bảng Xếp Hạng', icon: Trophy },
    { id: 'tournaments', label: 'Giải Đấu', icon: Swords },
    { id: 'matchmaker', label: 'Ghép Đội', icon: Zap },
    { id: 'chemistry', label: 'Độ Ăn Ý', icon: Flame },
  ];

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(8, 12, 20, 0.85)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div className="container flex-between" style={{ height: '74px' }}>
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ClubLogo size="md" showText={true} />
        </div>

        {/* Main Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '0.3rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? '700' : '500'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions & Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Quick Record Match Button */}
          <button
            onClick={() => setIsLogMatchOpen(true)}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PlusCircle size={16} style={{ color: 'var(--neon-lime)' }} />
            <span>Ghi Điểm Trận</span>
          </button>

          {/* Database Backup Tool */}
          <button
            onClick={() => setIsDataManagementOpen(true)}
            className="btn btn-ghost btn-sm"
            title="Sao lưu & Dữ liệu"
            style={{ padding: '0.5rem' }}
          >
            <Database size={17} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Current Role Badge - Reduced Administrator Font Size by 20% (0.8rem -> 0.64rem) */}
          {isAdmin ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(204, 255, 0, 0.12)',
                color: 'var(--neon-lime)',
                border: '1px solid var(--border-lime)',
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem 0.55rem',
                fontSize: '0.64rem',
                fontWeight: '700',
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}
            >
              <Shield size={12} />
              <span>Quản Trị Viên</span>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem 0.55rem',
                fontSize: '0.64rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              title="Nhấp để đăng nhập quyền Quản trị viên"
            >
              <User size={12} />
              <span>Khách Xem (Đăng nhập Admin)</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '0.45rem 0.65rem',
              color: '#f87171',
              borderRadius: 'var(--radius-md)'
            }}
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut size={16} />
            <span style={{ fontSize: '0.8rem' }}>Thoát</span>
          </button>
        </div>
      </div>
    </header>
  );
}
