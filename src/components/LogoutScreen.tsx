import React from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const LogoutScreen: React.FC = () => {
  const { dismissLogout, setActiveTab } = useApp();

  const handleReturnToLogin = () => {
    soundManager.playClick();
    dismissLogout();
    setActiveTab('vote');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-400 via-indigo-500 to-slate-400" />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 border border-slate-200 shadow-inner">
          <LogOut className="w-8 h-8 text-slate-600" />
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 mb-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          로그아웃 완료
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          정상적으로 로그아웃되었습니다
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          투표 세션이 안전하게 종료되었습니다.
          <br />
          다른 사번으로 투표하시려면 아래 버튼을 눌러주세요.
        </p>

        <div className="mt-8 space-y-3">
          <button
            id="btn-return-login"
            onClick={handleReturnToLogin}
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <span>투표 화면으로 돌아가기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>IPARK리조트 AI 바이브코딩 경진대회 공정투표 시스템</span>
        </div>
      </div>
    </div>
  );
};
