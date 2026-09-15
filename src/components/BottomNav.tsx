import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { Vote, BarChart3, Award, Trophy, Users } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, myVote, votes, participants } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'vote',
      label: '투표하기',
      icon: <Vote className="w-5 h-5" />,
      badge: myVote ? '완료' : '3개 선택',
    },
    {
      id: 'dashboard',
      label: '실시간 현황',
      icon: <BarChart3 className="w-5 h-5" />,
      badge: `${votes.length}표`,
    },
    {
      id: 'executive',
      label: '경영진 심사',
      icon: <Award className="w-5 h-5" />,
      badge: '70%',
    },
    {
      id: 'reveal',
      label: '순위 발표',
      icon: <Trophy className="w-5 h-5" />,
      badge: '긴장감',
    },
    {
      id: 'manage',
      label: '참여자 관리',
      icon: <Users className="w-5 h-5" />,
      badge: `${participants.length}팀`,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 safe-area-bottom">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative min-h-[48px] min-w-[56px] ${
                isActive
                  ? 'text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.id === 'vote' && myVote && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-6 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
