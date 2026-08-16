import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useClub } from '../../context/ClubContext';
import { UserPlus, Edit3, Upload, Image, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

export function MemberFormModal({ isOpen, onClose, memberToEdit = null }) {
  const { addMember, updateMember, requireAdmin } = useClub();
  const fileInputRef = useRef(null);

  const isEditing = Boolean(memberToEdit);

  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    gender: 'Nam',
    status: 'active', // 'active' | 'paused' | 'left'
    tier: 'Mới bắt đầu',
    elo: 1150,
    playStyle: 'Dink & Thả bóng kiểm soát',
    paddle: 'Vợt Carbon tiêu chuẩn',
    avatar: DEFAULT_AVATAR
  });

  const [uploadNotice, setUploadNotice] = useState('');

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        name: memberToEdit.name || '',
        nickname: memberToEdit.nickname || '',
        gender: memberToEdit.gender || 'Nam',
        status: memberToEdit.status || 'active',
        tier: memberToEdit.tier || 'Mới bắt đầu',
        elo: memberToEdit.elo || 1150,
        playStyle: memberToEdit.playStyle || 'Dink & Thả bóng kiểm soát',
        paddle: memberToEdit.paddle || 'Vợt Carbon tiêu chuẩn',
        avatar: memberToEdit.avatar || DEFAULT_AVATAR
      });
      setUploadNotice('');
    } else {
      setFormData({
        name: '',
        nickname: '',
        gender: 'Nam',
        status: 'active',
        tier: 'Mới bắt đầu',
        elo: 1150,
        playStyle: 'Dink & Thả bóng kiểm soát',
        paddle: 'Vợt Carbon tiêu chuẩn',
        avatar: DEFAULT_AVATAR
      });
      setUploadNotice('');
    }
  }, [memberToEdit, isOpen]);

  const handleTierChange = (newTier) => {
    let suggestedElo = 1150;
    if (newTier === 'Cao thủ / Chuyên nghiệp') suggestedElo = 1750;
    else if (newTier === 'Nâng cao') suggestedElo = 1620;
    else if (newTier === 'Trung cấp+') suggestedElo = 1530;
    else if (newTier === 'Trung cấp') suggestedElo = 1380;
    else if (newTier === 'Tiềm năng') suggestedElo = 1260;
    else if (newTier === 'Mới bắt đầu') suggestedElo = 1150;

    setFormData(prev => ({
      ...prev,
      tier: newTier,
      elo: isEditing ? prev.elo : suggestedElo
    }));
  };

  /**
   * Handle Upload Image from PC & Automatic Center-Crop Resize to exactly 75x75 px
   */
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tập tin hình ảnh hợp lệ (PNG, JPG, WEBP, JPEG...).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = document.createElement('img');
      img.onload = () => {
        // Create canvas of exact 75x75 pixels
        const canvas = document.createElement('canvas');
        canvas.width = 75;
        canvas.height = 75;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          alert('Không thể khởi tạo bộ xử lý ảnh canvas.');
          return;
        }

        // Apply high-quality interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Calculate center crop square
        const minDim = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
        const startX = ((img.naturalWidth || img.width) - minDim) / 2;
        const startY = ((img.naturalHeight || img.height) - minDim) / 2;

        // Draw cropped and scaled image onto 75x75 canvas
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, 75, 75);

        // Convert to optimized Base64 Data URL
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.92);

        setFormData(prev => ({
          ...prev,
          avatar: resizedDataUrl
        }));

        setUploadNotice(`Đã tải ảnh "${file.name}" và resize chuẩn 75×75 px thành công!`);
      };

      img.src = readerEvent.target?.result;
    };

    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.name.trim()) {
      alert('Vui lòng nhập họ và tên vận động viên.');
      return;
    }

    if (isEditing) {
      updateMember(memberToEdit.id, {
        name: formData.name.trim(),
        nickname: formData.nickname.trim() || formData.name.trim().split(' ').pop(),
        gender: formData.gender,
        status: formData.status,
        tier: formData.tier,
        elo: Number(formData.elo) || 1150,
        playStyle: formData.playStyle.trim() || 'Toàn diện',
        paddle: formData.paddle.trim() || 'Vợt Carbon tiêu chuẩn',
        avatar: formData.avatar || DEFAULT_AVATAR
      });
      alert(`Đã cập nhật thông tin hội viên "${formData.name}" thành công!`);
    } else {
      const created = addMember({
        name: formData.name.trim(),
        nickname: formData.nickname.trim() || formData.name.trim().split(' ').pop(),
        gender: formData.gender,
        status: formData.status,
        tier: formData.tier,
        elo: Number(formData.elo) || 1150,
        playStyle: formData.playStyle.trim() || 'Toàn diện',
        paddle: formData.paddle.trim() || 'Vợt Carbon tiêu chuẩn',
        avatar: formData.avatar || DEFAULT_AVATAR
      });
      if (created) {
        alert(`Đã thêm thành công hội viên "${formData.name}" vào CLB!`);
      }
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Chỉnh Sửa Hội Viên: ${memberToEdit?.name}` : 'Đăng Ký Hội Viên CLB Mới'}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            className="btn btn-primary"
            style={{ fontWeight: '700' }}
          >
            {isEditing ? <Edit3 size={16} /> : <UserPlus size={16} />}
            <span>{isEditing ? 'Lưu Thay Đổi' : 'Thêm Hội Viên'}</span>
          </button>
        </>
      }
    >
      <form id="member-form" onSubmit={handleFormSubmit}>
        {/* AVATAR UPLOAD & 75x75 RESIZE SECTION */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(204, 255, 0, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap'
          }}
        >
          {/* 75x75 Preview Box */}
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <img
              src={formData.avatar}
              alt="Avatar preview"
              style={{
                width: '75px',
                height: '75px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                border: '2px solid var(--neon-lime)',
                boxShadow: '0 0 12px rgba(204, 255, 0, 0.25)',
                display: 'block'
              }}
            />
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--neon-lime)',
                fontWeight: '700',
                display: 'block',
                marginTop: '0.3rem'
              }}
            >
              75 × 75 px
            </span>
          </div>

          {/* Upload Action Area */}
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <Sparkles size={15} style={{ color: 'var(--neon-lime)' }} />
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Ảnh Đại Diện Hội Viên
              </strong>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.65rem 0', lineHeight: '1.4' }}>
              Tải ảnh từ máy tính (PC). Hệ thống sẽ <strong>tự động cắt vuông và resize về đúng 75×75 px</strong> siêu nét.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem' }}
              >
                <Upload size={14} />
                <span>Chọn ảnh từ PC</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const randomId = Math.floor(Math.random() * 1000);
                  setFormData(prev => ({
                    ...prev,
                    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80&r=${randomId}`
                  }));
                  setUploadNotice('Đã chọn ảnh mẫu ngẫu nhiên.');
                }}
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}
              >
                <RefreshCw size={13} />
                <span>Ảnh mẫu</span>
              </button>
            </div>

            {uploadNotice && (
              <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={13} />
                <span>{uploadNotice}</span>
              </div>
            )}
          </div>
        </div>

        {/* Member Details */}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Họ và Tên *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="VD: Phạm Linh, Tuấn Anh..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Biệt danh trên sân</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: Sát Thủ, Rồng Lửa..."
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Trạng Thái Hoạt Động *</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{
                fontWeight: '700',
                color: formData.status === 'active' ? '#34d399' : formData.status === 'paused' ? '#fbbf24' : '#94a3b8'
              }}
            >
              <option value="active">🟢 Hoạt động (Sinh hoạt thường xuyên)</option>
              <option value="paused">🟡 Tạm nghỉ (Tạm dừng thi đấu/chấn thương)</option>
              <option value="left">⚪ Rời CLB (Đã chuyển câu lạc bộ)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Giới Tính</label>
            <select
              className="form-select"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Hạng trình độ / Phân cấp</label>
            <select
              className="form-select"
              value={formData.tier}
              onChange={(e) => handleTierChange(e.target.value)}
            >
              <option value="Cao thủ / Chuyên nghiệp">Cao thủ / Chuyên nghiệp (4.5 - 5.5+ DUPR)</option>
              <option value="Nâng cao">Nâng cao (4.0 - 4.5 DUPR)</option>
              <option value="Trung cấp+">Trung cấp+ (3.75 - 4.0 DUPR)</option>
              <option value="Trung cấp">Trung cấp (3.25 - 3.75 DUPR)</option>
              <option value="Tiềm năng">Tiềm năng (3.0 - 3.25 DUPR)</option>
              <option value="Mới bắt đầu">Mới bắt đầu (2.5 - 3.0 DUPR)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Điểm Elo</label>
            <input
              type="number"
              min="800"
              max="2400"
              className="form-control"
              value={formData.elo}
              onChange={(e) => setFormData({ ...formData, elo: e.target.value })}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Sở trường / Lối chơi</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: Đập bóng uy lực, Cắt dink mềm"
              value={formData.playStyle}
              onChange={(e) => setFormData({ ...formData, playStyle: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Vợt thi đấu</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: Selkirk Vanguard, Joola Perseus"
              value={formData.paddle}
              onChange={(e) => setFormData({ ...formData, paddle: e.target.value })}
            />
          </div>
        </div>

        {/* Optional Custom Image URL */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Hoặc nhập đường dẫn ảnh đại diện trực tiếp (URL)
          </label>
          <input
            type="url"
            className="form-control"
            placeholder="https://..."
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            style={{ fontSize: '0.8rem' }}
          />
        </div>
      </form>
    </Modal>
  );
}
