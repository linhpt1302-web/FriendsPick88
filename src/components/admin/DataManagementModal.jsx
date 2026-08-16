import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useClub } from '../../context/ClubContext';
import { Download, Upload, RotateCcw, AlertTriangle, CheckCircle2, FileText, Copy, Database } from 'lucide-react';

export function DataManagementModal({ isOpen, onClose }) {
  const { members, matches, tournaments, resetToDefaultData, importBackupData, requireAdmin } = useClub();
  const fileInputRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);

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

  const handleCopyJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      club: 'Friends Pickleball Club',
      members,
      matches,
      tournaments
    };

    navigator.clipboard.writeText(JSON.stringify(backupData, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    requireAdmin(() => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const result = importBackupData(content);
          if (result.success) {
            alert('🎉 Đã nhập và đồng bộ thành công dữ liệu từ tệp sao lưu!');
            if (fileInputRef.current) fileInputRef.current.value = '';
            onClose();
          } else {
            alert('Không thể nhập dữ liệu: ' + (result.message || 'Tệp không hợp lệ'));
          }
        } catch (err) {
          alert('Lỗi đọc tệp sao lưu JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleResetData = () => {
    requireAdmin(() => {
      if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ danh sách 29 hội viên, lịch sử đấu và giải đấu về dữ liệu mặc định ban đầu của CLB Friends?')) {
        resetToDefaultData();
        alert('Đã khôi phục thành công dữ liệu mặc định ban đầu của CLB Friends!');
        onClose();
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản Lý & Đồng Bộ Dữ Liệu CLB"
      size="md"
      footer={
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Đóng
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Info notice about instant browser persistence */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(204, 255, 0, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}
        >
          <Database size={20} style={{ color: 'var(--neon-lime)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Mọi thay đổi thông tin thành viên, điểm số và giải đấu được <strong style={{ color: 'var(--neon-lime)' }}>tự động lưu ngay lập tức</strong> vào trình duyệt của bạn.
          </span>
        </div>

        {/* Export Section */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            1. Xuất Bản Sao Lưu Dữ Liệu (Tải Về Máy)
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            Tải về tệp JSON chứa toàn bộ {members.length} hội viên, {matches.length} trận đấu và các giải đấu hiện tại để lưu trữ hoặc chuyển sang máy khác.
          </p>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button onClick={handleExportJSON} className="btn btn-primary btn-sm">
              <Download size={15} />
              <span>Tải Tệp Sao Lưu (.json)</span>
            </button>

            <button onClick={handleCopyJSON} className="btn btn-secondary btn-sm">
              {copySuccess ? <CheckCircle2 size={15} style={{ color: '#34d399' }} /> : <Copy size={15} />}
              <span>{copySuccess ? 'Đã Sao Chép!' : 'Sao Chép Mã JSON'}</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            2. Nhập Dữ Liệu Từ Tệp Sao Lưu (.json)
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            Chọn tệp sao lưu JSON đã lưu từ máy tính khác hoặc điện thoại để nạp vào trang web:
          </p>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="btn btn-cyan btn-sm"
          >
            <Upload size={15} />
            <span>Chọn Tệp JSON Để Nhập Dữ Liệu</span>
          </button>
        </div>

        {/* Reset to Default Seed Data */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.06)',
            padding: '1.15rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', marginBottom: '0.25rem' }}>
            <AlertTriangle size={16} />
            <h4 style={{ fontSize: '0.92rem', margin: 0 }}>Khôi Phục Danh Sách & Dữ Liệu Mặc Định</h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Đặt lại 29 thành viên gốc (Elo 1260 & 1150), 0 trận đấu và giải đấu mẫu 4 bảng.
          </p>
          <button onClick={handleResetData} className="btn btn-danger btn-sm">
            <RotateCcw size={14} />
            <span>Khôi Phục Dữ Liệu Gốc</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
