import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { ClubLogo } from '../common/ClubLogo';
import { Shield, KeyRound, User, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export function LoginGate() {
  const { login } = useClub();
  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin' | 'guest'
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminPassword.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu quản trị viên.');
      return;
    }

    const result = login('admin', adminPassword);
    if (!result.success) {
      setErrorMessage(result.message || 'Mật khẩu quản trị viên không chính xác.');
    }
  };

  const handleGuestSubmit = () => {
    login('guest');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, rgba(204, 255, 0, 0.08) 0%, rgba(11, 15, 25, 0.98) 65%)',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Glow Pillars */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '20%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'rgba(204, 255, 0, 0.05)',
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '20%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'rgba(6, 182, 212, 0.05)',
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }}
      />

      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.7)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Logo & Welcome Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <ClubLogo size="lg" showText={false} />
          </div>
          <h1
            style={{
              fontSize: '1.55rem',
              fontWeight: '800',
              margin: '0 0 0.4rem 0',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            CLB PICKLEBALL FRIENDS
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
            Hệ Thống Quản Lý Bảng Xếp Hạng & Giải Đấu Đôi Chuyên Nghiệp
          </p>
        </div>

        {/* Role Selector Tabs - Administrator font size reduced by 20% */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.75rem'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setSelectedRole('admin');
              setErrorMessage('');
            }}
            className={`btn btn-sm ${selectedRole === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              borderRadius: 'var(--radius-sm)',
              padding: '0.55rem 0.75rem',
              fontSize: '0.68rem', /* 20% smaller than 0.85rem */
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}
          >
            <Shield size={13} />
            <span>Quản Trị Viên</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('guest');
              setErrorMessage('');
            }}
            className={`btn btn-sm ${selectedRole === 'guest' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              borderRadius: 'var(--radius-sm)',
              padding: '0.55rem 0.75rem',
              fontSize: '0.68rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}
          >
            <User size={13} />
            <span>Khách Xem</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.25rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Admin Form View - Administrator font size reduced by 20% */}
        {selectedRole === 'admin' ? (
          <form onSubmit={handleAdminSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem' }}>
                <KeyRound size={13} style={{ color: 'var(--neon-lime)' }} />
                <span>Mật Khẩu Quản Trị Viên (Admin)</span>
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-control"
                  placeholder="Nhập mật khẩu quản trị..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{
                    paddingRight: '2.75rem',
                    fontSize: '0.95rem',
                    letterSpacing: showPassword ? 'normal' : '0.15em'
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                fontSize: '0.76rem', /* 20% smaller than 0.95rem */
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Lock size={15} />
              <span>Đăng Nhập Quản Trị Viên</span>
            </button>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.25rem', marginBottom: 0 }}>
              Quyền Quản trị viên cho phép ghi điểm trận đấu, tạo giải đấu, xóa giải đấu và thêm thành viên CLB.
            </p>
          </form>
        ) : (
          /* Guest Access View */
          <div>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
                fontSize: '0.82rem',
                lineHeight: '1.6',
                color: 'var(--text-secondary)'
              }}
            >
              <strong style={{ color: 'var(--neon-cyan)', display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                Quyền Hạn Khách Xem:
              </strong>
              • Tra cứu Bảng Xếp Hạng Elo & DUPR các hội viên.<br />
              • Xem lịch thi đấu và bảng điểm các bảng giải đấu.<br />
              • Trải nghiệm công cụ Ghép đội thông minh & Độ ăn ý.
            </div>

            <button
              type="button"
              onClick={handleGuestSubmit}
              className="btn btn-outline"
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                justifyContent: 'center'
              }}
            >
              <span>Truy Cập Với Quyền Khách Xem</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
