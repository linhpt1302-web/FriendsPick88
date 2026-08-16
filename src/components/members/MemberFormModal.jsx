import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useClub } from '../../context/ClubContext';
import { UserPlus, Edit3, User, Check, Shield } from 'lucide-react';

export function MemberFormModal({ isOpen, onClose, memberToEdit = null }) {
  const { addMember, updateMember, requireAdmin } = useClub();

  const isEditing = Boolean(memberToEdit);

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    gender: 'Nam',
    status: 'active', // 'active' | 'paused' | 'left'
    tier: 'Mới bắt đầu',
    elo: 1150,
    playStyle: 'Dink & Thả bóng kiểm soát',
    paddle: 'Vợt Carbon tiêu chuẩn',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

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
        avatar: memberToEdit.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
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
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
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
        avatar: formData.avatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
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
        avatar: formData.avatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
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

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Đường dẫn ảnh đại diện (Avatar URL)</label>
          <input
            type="url"
            className="form-control"
            placeholder="https://..."
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
}
