import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Vote, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export const EmployeeLoginGate: React.FC = () => {
  const { loginEmployee, hasEmployeeVoted, canRevote } = useApp();

  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const cleanId = employeeId.trim();
  const alreadyVoted = cleanId ? hasEmployeeVoted(cleanId) : false;
  const isRevoteAllowed = cleanId ? canRevote(cleanId) : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanId) {
      setErrorMsg('사번을 입력해주세요.');
      soundManager.playClick();
      return;
    }

    if (cleanId.length !== 6) {
      setErrorMsg('사번은 6자리로 입력해주세요. (예: 240001)');
      soundManager.playClick();
      return;
    }

    if (!employeeName.trim()) {
      setErrorMsg('성함을 입력해주세요.');
      soundManager.playClick();
      return;
    }

    loginEmployee(cleanId, employeeName.trim());
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 px-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-inner border border-indigo-100">
            <Vote className="w-7 h-7" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            공정 투표 시스템 (1인 1회 3표)
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            IPARK리조트 AI 바이브코딩 경진대회 투표
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
            공정한 투표를 위해 사번당 1회(3개 팀 선택) 투표권이 부여됩니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              사번 <span className="text-indigo-600 font-normal">(6자리 숫자/문자)</span>
            </label>
            <input
              id="input-employee-id"
              type="text"
              maxLength={6}
              autoFocus
              required
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value.trim());
                setErrorMsg('');
              }}
              placeholder="예: 240001"
              className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono tracking-wider"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              성함
            </label>
            <input
              id="input-employee-name"
              type="text"
              required
              value={employeeName}
              onChange={(e) => {
                setEmployeeName(e.target.value);
                setErrorMsg('');
              }}
              placeholder="성함을 입력해주세요 (예: 홍길동)"
              className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Status Indicator for entered ID */}
          {cleanId.length === 6 && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              alreadyVoted 
                ? (isRevoteAllowed ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200')
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {alreadyVoted ? (
                isRevoteAllowed ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      투표 내역이 있는 사번입니다. 입장 시 <strong>선택 내역 확인 및 1회 재투표</strong>가 가능합니다.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      이미 재투표까지 모두 완료된 사번입니다. 입장 시 <strong>최종 투표 내역 확인만 가능</strong>합니다.
                    </span>
                  </>
                )
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    신규 투표 가능한 사번입니다! (우수 3개 팀 선택)
                  </span>
                </>
              )}
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-500 font-bold text-center">
              {errorMsg}
            </p>
          )}

          <button
            id="btn-login-employee"
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <span>투표장 입장하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
