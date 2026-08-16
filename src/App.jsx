import React from 'react';
import { ClubProvider, useClub } from './context/ClubContext';
import { LoginGate } from './components/auth/LoginGate';
import { Navbar } from './components/common/Navbar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { MemberList } from './components/members/MemberList';
import { LadderView } from './components/rankings/LadderView';
import { TournamentList } from './components/tournaments/TournamentList';
import { SmartMatchmaker } from './components/matchmaker/SmartMatchmaker';
import { PartnershipChemistry } from './components/chemistry/PartnershipChemistry';
import { LogMatchModal } from './components/rankings/LogMatchModal';
import { DataManagementModal } from './components/admin/DataManagementModal';
import { AuthModal } from './components/auth/AuthModal';
import { ClubLogo } from './components/common/ClubLogo';

function MainApp() {
  const { 
    currentUser,
    activeTab, 
    isLogMatchOpen, 
    setIsLogMatchOpen, 
    isDataManagementOpen, 
    setIsDataManagementOpen,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = useClub();

  // Mandatory Login Gate: Lock website if not logged in
  if (!currentUser) {
    return <LoginGate />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'members' && <MemberList />}
        {activeTab === 'rankings' && <LadderView />}
        {activeTab === 'tournaments' && <TournamentList />}
        {activeTab === 'matchmaker' && <SmartMatchmaker />}
        {activeTab === 'chemistry' && <PartnershipChemistry />}
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <LogMatchModal
        isOpen={isLogMatchOpen}
        onClose={() => setIsLogMatchOpen(false)}
      />

      <DataManagementModal
        isOpen={isDataManagementOpen}
        onClose={() => setIsDataManagementOpen(false)}
      />

      {/* Club Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(11, 15, 25, 0.95)',
          padding: '2.5rem 0',
          marginTop: 'auto'
        }}
      >
        <div className="container flex-between" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <ClubLogo size="sm" showText={true} />
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Hệ thống quản lý bảng xếp hạng bậc thang đôi & giải đấu chính thức của CLB
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Luật tính điểm: Chạm 15 (Vòng bảng) • Chạm 11 Bo3 (Chung kết)</span>
            <span>•</span>
            <span>Hệ thống Elo Động</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ClubProvider>
      <MainApp />
    </ClubProvider>
  );
}
