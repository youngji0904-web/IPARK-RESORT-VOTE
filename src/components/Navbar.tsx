import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Shield, 
  User, 
  Trophy, 
  Users, 
  LayoutDashboard,
  Lock,
  LogOut
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export const Navbar: React.FC = () => {
  const { 
    isMuted, 
    toggleSound, 
    myVote, 
    setOpenMyVoteModal, 
    userRole, 
    setUserRole,
    adminSubTab,
    setAdminSubTab
  } = useApp();

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleAdminSwitchClick = () => {
    if (userRole === 'employee') {
      // Prompt for quick pin or direct switch
      setShowPinModal(true);
      setPinInput('');
      setPinError(false);
    } else {
      // Switch back to employee view
      setUserRole('employee');
      soundManager.playClick();
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only allow admin employee ID: 240032
    if (pinInput.trim() === '240032') {
      setUserRole('admin');
      setShowPinModal(false);
      soundManager.playSelect();
    } else {
      setPinError(true);
      soundManager.playClick();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Branding & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI Vibe Coding 2026
                </span>
                {userRole === 'admin' ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-purple-600" />
                    관리자 상황실
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    임직원 투표장
                  </span>
                )}
              </div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                IPARK리조트 AI 바이브코딩 경진대회
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* If in Employee View and voted, show '내 투표 확인' */}
            {userRole === 'employee' && myVote && (
              <button
                id="btn-my-vote-status"
                onClick={() => setOpenMyVoteModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">내가 뽑은 3팀</span>
                <span className="sm:hidden">내 투표</span>
              </button>
            )}

            {/* Admin Sub-navigation (Only visible to Admin) */}
            {userRole === 'admin' && (
              <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setAdminSubTab('total')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    adminSubTab === 'total'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  토탈 대시보드
                </button>
                <button
                  onClick={() => setAdminSubTab('reveal')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    adminSubTab === 'reveal'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  순위 발표
                </button>
                <button
                  onClick={() => setAdminSubTab('manage')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    adminSubTab === 'manage'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  참가자 관리
                </button>
              </div>
            )}

            {/* Role Switch & Logout Buttons */}
            {userRole === 'admin' ? (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-role-switch"
                  onClick={handleAdminSwitchClick}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">임직원 투표화면 보기</span>
                  <span className="sm:hidden">투표화면</span>
                </button>
                <button
                  id="btn-admin-logout"
                  onClick={() => {
                    setUserRole('employee');
                    try {
                      sessionStorage.removeItem('vibe_user_role_v1');
                      localStorage.removeItem('vibe_user_role_v1');
                    } catch {
                      // ignore
                    }
                    soundManager.playClick();
                  }}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all cursor-pointer"
                  title="관리자 로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">관리자 로그아웃</span>
                  <span className="sm:hidden">로그아웃</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-role-switch"
                onClick={handleAdminSwitchClick}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-600 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-200" />
                <span className="hidden sm:inline">관리자 화면</span>
                <span className="sm:hidden">관리자</span>
              </button>
            )}

            {/* Sound Mute Toggle */}
            <button
              id="btn-sound-toggle"
              onClick={toggleSound}
              aria-label={isMuted ? '소리 켜기' : '소리 끄기'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
              title={isMuted ? '효과음 켜기' : '효과음 끄기'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile secondary tab bar for admin */}
        {userRole === 'admin' && (
          <div className="md:hidden flex items-center justify-around mt-2 pt-2 border-t border-slate-200 text-xs font-bold">
            <button
              onClick={() => setAdminSubTab('total')}
              className={`py-1.5 px-3 rounded-lg flex items-center gap-1 ${
                adminSubTab === 'total' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              토탈 대시보드
            </button>
            <button
              onClick={() => setAdminSubTab('reveal')}
              className={`py-1.5 px-3 rounded-lg flex items-center gap-1 ${
                adminSubTab === 'reveal' ? 'bg-amber-50 text-amber-700' : 'text-slate-600'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              순위 발표
            </button>
            <button
              onClick={() => setAdminSubTab('manage')}
              className={`py-1.5 px-3 rounded-lg flex items-center gap-1 ${
                adminSubTab === 'manage' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              참가자 관리
            </button>
          </div>
        )}
      </header>

      {/* Admin Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 text-center">
              관리자 모드 전환
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1 font-medium">
              비밀번호를 입력해주세요.
            </p>

            <form onSubmit={handlePinSubmit} className="mt-4 space-y-3">
              <input
                type="password"
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="비밀번호 입력"
                className="w-full py-2.5 px-3.5 text-center text-base font-bold tracking-widest rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {pinError && (
                <p className="text-xs text-rose-500 text-center font-bold">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  관리자 입장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
