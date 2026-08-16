import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useClub, ADMIN_PASSWORD } from '../../context/ClubContext';
import { Shield, KeyRound, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function AuthModal({ isOpen, onClose }) {
  const { login } = useClub();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');

    if (!password.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu quản trị viên.');
      return;
    }

    const res = login('admin', password.trim());
    if (res.success) {
      setPassword('');
      onClose();
    } else {
      setErrorMessage(res.message || 'Mật khẩu quản trị viên không chính xác.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác Thực Quyền Quản Trị Viên (Admin)"
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Hủy Bỏ
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            className="btn btn-primary btn-sm" 
            style={{ fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '700' }}
          >
            <Lock size={14} />
            <span>Xác Nhận Đăng Nhập</span>
          </button>
        </>
      }
    >
      <form id="admin-auth-modal-form" onSubmit={handleSubmit}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(204, 255, 0, 0.1)',
              color: 'var(--neon-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              boxShadow: '0 0 16px rgba(204, 255, 0, 0.2)'
            }}
          >
            <Shield size={24} />
          </div>
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0' }}>Yêu Cầu Quyền Quản Trị</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Bạn cần xác thực quyền Quản trị viên để ghi điểm hoặc chỉnh sửa dữ liệu CLB.
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '0.55rem 0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.85rem'
            }}
          >
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: '700' }}>
            <KeyRound size={13} style={{ color: 'var(--neon-lime)' }} />
            <span>Mật Khẩu Quản Trị Viên</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="form-control"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: '2.5rem', fontSize: '0.95rem' }}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
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
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
