import fs from 'fs';
import path from 'path';

// Load members and tournaments data
const rawData = fs.readFileSync(path.join(process.cwd(), 'backup-input.json'), 'utf8');
const data = JSON.parse(rawData);

const seedDataContent = `/**
 * Friends Pickleball Club - Roster & Initial Clean Data
 * Tự động cập nhật theo dữ liệu backup mới nhất từ người dùng.
 */

export const INITIAL_MEMBERS = ${JSON.stringify(data.members, null, 2)};

export const INITIAL_MATCHES = ${JSON.stringify(data.matches || [], null, 2)};

export const INITIAL_TOURNAMENTS = ${JSON.stringify(data.tournaments || [], null, 2)};

export const BADGE_DEFINITIONS = {
  'hot-streak': {
    id: 'hot-streak',
    name: 'Chuỗi Bất Bại',
    description: 'Đạt chuỗi 3 trận thắng liên tiếp',
    icon: '🔥',
    color: '#ff4d4d'
  },
  'veteran': {
    id: 'veteran',
    name: 'Lão Tướng CLB',
    description: 'Tham gia hơn 15 trận đấu chính thức',
    icon: '🛡️',
    color: '#a855f7'
  },
  'ace-server': {
    id: 'ace-server',
    name: 'Vua Giao Bóng',
    description: 'Kỹ năng giao bóng ghi điểm trực tiếp xuất sắc',
    icon: '⚡',
    color: '#eab308'
  },
  'mvp': {
    id: 'mvp',
    name: 'Nhà Vô Địch',
    description: 'Vô địch giải đấu chính thức CLB Friends',
    icon: '👑',
    color: '#ccff00'
  }
};
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'seedData.js'), seedDataContent, 'utf8');
console.log('Successfully updated src/data/seedData.js with ' + data.members.length + ' members!');
