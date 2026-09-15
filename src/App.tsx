import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { VotingView } from './components/VotingView';
import { AdminTotalDashboard } from './components/AdminTotalDashboard';
import { AwardRevealView } from './components/AwardRevealView';
import { ParticipantManagerView } from './components/ParticipantManagerView';
import { MyVoteSummaryModal } from './components/MyVoteSummaryModal';

const AppContent: React.FC = () => {
  const { userRole, adminSubTab, setAdminSubTab } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar with Role Indicator & Switcher */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4">
        {userRole === 'employee' ? (
          /* Employee Mode: Only voting interface */
          <VotingView />
        ) : (
          /* Admin Mode: Total Dashboard, Reveal, or Participant Management */
          <>
            {adminSubTab === 'total' && (
              <AdminTotalDashboard 
                onOpenAddModal={() => setShowAddModal(true)}
                onOpenRevealCeremony={() => setAdminSubTab('reveal')}
              />
            )}
            {adminSubTab === 'reveal' && <AwardRevealView />}
            {adminSubTab === 'manage' && <ParticipantManagerView />}
          </>
        )}
      </main>

      {/* My Vote Summary Modal */}
      <MyVoteSummaryModal />

      {/* Quick Add Candidate Modal for Admin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ParticipantManagerView 
              isModal={true} 
              onClose={() => setShowAddModal(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
