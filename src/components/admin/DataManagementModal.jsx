import React from 'react';
import { Modal } from '../common/Modal';
import { useClub } from '../../context/ClubContext';
import { Download, RotateCcw, AlertTriangle } from 'lucide-react';

export function DataManagementModal({ isOpen, onClose }) {
  const { members, matches, tournaments, resetToDefaultData, requireAdmin } = useClub();

  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      club: 'Friends Pickleball Club',
      members,
      matches,
      tournaments
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `friends_pickleball_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (!requireAdmin()) return;

    if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ danh sách hội viên, lịch sử đấu và giải đấu về dữ liệu mẫu ban đầu của CLB Friends?')) {
      resetToDefaultData();
      alert('Đã khôi phục thành công dữ liệu mẫu của CLB Friends!');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cài Đặt Dữ Liệu & Sao Lưu CLB"
      size="md"
      footer={
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Đóng
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Export Section */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <h4 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Xuất Bản Sao Lưu Dữ Liệu (JSON)</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Tải về toàn bộ hồ sơ {members.length} hội viên, {matches.length} lịch sử trận đấu và bảng đấu giải hiện tại.
          </p>
          <button onClick={handleExportJSON} className="btn btn-outline btn-sm">
            <Download size={16} />
            <span>Tải Xuống Tệp Sao Lưu JSON</span>
          </button>
        </div>

        {/* Reset to Default Seed Data */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.06)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', marginBottom: '0.35rem' }}>
            <AlertTriangle size={18} />
            <h4 style={{ fontSize: '1rem', margin: 0 }}>Khôi Phục Danh Sách & Dữ Liệu Mẫu</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Tải lại 16 vận động viên ban đầu của CLB Friends, các trận đấu mẫu và giải đấu đôi Summer Slam 2026.
          </p>
          <button onClick={handleResetData} className="btn btn-danger btn-sm">
            <RotateCcw size={16} />
            <span>Khôi Phục Dữ Liệu Mặc Định</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
