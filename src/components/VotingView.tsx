import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Check, 
  Sparkles, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Layers,
  LogOut,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { EmployeeLoginGate } from './EmployeeLoginGate';
import { LogoutScreen } from './LogoutScreen';
import { soundManager } from '../utils/audio';

export const VotingView: React.FC = () => {
  const { 
    participants, 
    myVote, 
    submitVote, 
    currentEmployeeId,
    currentEmployeeName,
    logoutEmployee,
    canRevote,
    revoteCountForEmployee,
    isLoggedOut
  } = useApp();

  // If user just logged out, show the logout screen
  if (isLoggedOut) {
    return <LogoutScreen />;
  }

  // If no Employee ID authenticated, show the login gate
  if (!currentEmployeeId) {
    return <EmployeeLoginGate />;
  }

  // State to track if the user is in "re-voting" edit mode
  const [isEditing, setIsEditing] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return myVote ? myVote.selectedParticipantIds : [];
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Sync selectedIds when myVote changes
  useEffect(() => {
    if (myVote) {
      setSelectedIds(myVote.selectedParticipantIds);
    } else {
      setSelectedIds([]);
    }
  }, [myVote]);

  const revoteAllowed = currentEmployeeId ? canRevote(currentEmployeeId) : false;
  const revotesUsed = currentEmployeeId ? revoteCountForEmployee(currentEmployeeId) : 0;

  const toggleSelect = (id: string) => {
    soundManager.playSelect();
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        soundManager.playClick();
        return;
      }
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length < 1 || selectedIds.length > 3) return;

    const ok = submitVote(selectedIds, currentEmployeeName || `사번 ${currentEmployeeId}`);
    if (ok) {
      setIsEditing(false);
    }
  };

  const handleStartRevote = () => {
    if (!revoteAllowed) return;
    soundManager.playClick();
    setIsEditing(true);
  };

  const handleCancelRevote = () => {
    soundManager.playClick();
    if (myVote) {
      setSelectedIds(myVote.selectedParticipantIds);
    }
    setIsEditing(false);
  };

  // Find the selected participant details for the summary screen
  const votedParticipants = myVote
    ? myVote.selectedParticipantIds
        .map((id) => participants.find((p) => p.id === id))
        .filter(Boolean)
    : [];

  // =========================================================================
  // VIEW 1: Dedicated "제출했습니다!" Confirmation Screen
  // If the employee has already voted and is NOT actively in re-vote editing mode
  // =========================================================================
  if (myVote && !isEditing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Session Bar */}
        <div className="mb-5 p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 mr-2">
                사번: {currentEmployeeId}
              </span>
              <span className="text-xs font-black text-slate-900">
                {currentEmployeeName}
              </span>
            </div>
          </div>

          <button
            id="btn-logout-employee"
            onClick={logoutEmployee}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>

        {/* Big "제출했습니다!" Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500" />

          {/* Success Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-md shadow-emerald-500/10 border border-emerald-200 animate-bounce duration-1000">
            <Check className="w-9 h-9 sm:w-11 sm:h-11 stroke-[3]" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            투표 접수 완료
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            제출했습니다!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
            <strong className="text-indigo-600">{currentEmployeeName}</strong>({currentEmployeeId})님의 {myVote.selectedParticipantIds.length}표가 정상 반영되었습니다.
          </p>

          <div className="text-[11px] text-slate-400 mt-1">
            투표 일시: {new Date(myVote.timestamp).toLocaleString([], {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>

          {/* Section: Intuitive display of "내가 투표한 팀" */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                내가 투표한 {votedParticipants.length}개 팀 확인
              </h3>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                총 {votedParticipants.length}팀 선택 완료
              </span>
            </div>

            <div className="space-y-3">
              {votedParticipants.map((p, idx) => {
                if (!p) return null;
                const pickBadgeColors = [
                  'bg-indigo-600 text-white shadow-indigo-500/20',
                  'bg-purple-600 text-white shadow-purple-500/20',
                  'bg-teal-600 text-white shadow-teal-500/20',
                ];

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all flex items-start gap-3.5 shadow-xs"
                  >
                    {/* Pick Badge */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${pickBadgeColors[idx] || 'bg-slate-700 text-white'}`}>
                      {idx + 1}픽
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-sm sm:text-base font-black text-slate-900">
                          {p.name}
                        </h4>
                        {p.department && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                            {p.department}
                          </span>
                        )}
                        {p.tag && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                            {p.tag}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                        {p.topic}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revote Opportunity Section (Only 1 chance!) */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            {revoteAllowed ? (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      투표 내용을 수정하고 싶으신가요?
                    </h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      사번당 <strong>단 1회의 재투표 기회</strong>가 주어집니다.
                      <br />
                      다시 투표하여 제출하면 기존 투표는 취소되며, <strong>이후에는 더 이상 수정이 불가</strong>합니다.
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-right">
                  <button
                    id="btn-start-revote"
                    onClick={handleStartRevote}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>다시 투표하기 (기회 1회 남음)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                  <Lock className="w-4 h-4 text-slate-500" />
                  최종 투표 완료 (재투표 불가)
                </div>
                <p className="text-xs text-slate-500">
                  제공된 1회의 재투표 기회를 모두 사용하여 더 이상 투표를 변경할 수 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: Active Voting / Re-Voting Screen
  // User selects exactly 3 candidate cards and submits
  // =========================================================================
  const filteredParticipants = participants.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.topic.toLowerCase().includes(q) ||
      (p.department && p.department.toLowerCase().includes(q)) ||
      (p.tag && p.tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pb-32 max-w-4xl mx-auto px-4 pt-2">
      {/* Top Employee ID Authentication Bar */}
      <div className="mb-4 p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                사번: {currentEmployeeId}
              </span>
              <span className="text-xs font-black text-slate-900">
                {currentEmployeeName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={handleCancelRevote}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
            >
              취소
            </button>
          )}
          <button
            onClick={logoutEmployee}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200 cursor-pointer"
            title="로그아웃"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </div>
      </div>

      {/* Main Instruction Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border border-indigo-100 p-6 sm:p-7 mb-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            최대 3팀 자율 투표제 (1~3팀 선택 가능)
          </span>
          <span className="text-xs text-slate-500 font-medium">
            임직원 투표 <strong className="text-indigo-600">30%</strong> 반영
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {isEditing 
            ? '재투표: 우수사례를 다시 선택해주세요 (최대 3팀)' 
            : 'AI 바이브코딩 사례 중 우수사례 최대 3팀을 골라주세요'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed max-w-2xl font-medium">
          1팀 또는 2팀만 선택하셔도 투표가 가능합니다. {isEditing && '이번 제출 후에는 더 이상 수정할 수 없습니다.'}
        </p>

        {isEditing && (
          <div className="mt-3 p-3 rounded-xl bg-amber-100/70 border border-amber-300 text-xs font-bold text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>재투표 모드 진행 중: 팀을 선택하신 후 하단에서 제출하시면 최종 투표로 확정됩니다.</span>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="input-candidate-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="참여자 이름, 부서, 프로젝트 키워드로 검색..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs"
        />
      </div>

      {/* Selection Progress Pill */}
      <div className="sticky top-16 z-30 mb-5 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span className="text-xs sm:text-sm font-bold text-slate-700">
            후보 선택 현황:
          </span>
          <span className={`text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-full ${
            selectedIds.length >= 1 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            {selectedIds.length} / 최대 3팀 선택됨
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((idx) => {
            const isFilled = idx < selectedIds.length;
            return (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  isFilled
                    ? 'bg-indigo-600 scale-110 shadow-xs'
                    : 'bg-slate-200 border border-slate-300'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Candidates List */}
      {filteredParticipants.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-dashed border-slate-300">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">검색된 참여자가 없습니다</p>
          <p className="text-xs text-slate-500 mt-1">
            검색어를 지우고 전체 목록을 확인해보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredParticipants.map((participant) => {
            const isSelected = selectedIds.includes(participant.id);
            const selectionIndex = selectedIds.indexOf(participant.id);

            return (
              <div
                key={participant.id}
                id={`candidate-card-${participant.id}`}
                onClick={() => toggleSelect(participant.id)}
                className={`group cursor-pointer text-left rounded-2xl p-4 sm:p-5 transition-all relative border flex flex-col justify-between select-none shadow-xs ${
                  isSelected
                    ? 'bg-indigo-50/50 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top row: Tags + Selection Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {participant.department && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {participant.department}
                        </span>
                      )}
                      {participant.tag && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                          {participant.tag}
                        </span>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    <div className="shrink-0">
                      {isSelected ? (
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/30">
                          {selectionIndex + 1}픽
                        </span>
                      ) : (
                        <span className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-slate-300 group-hover:border-slate-400 transition-colors" />
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {participant.name}
                  </h3>

                  {/* Topic */}
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed font-medium">
                    {participant.topic}
                  </p>
                </div>

                {/* Footer hint */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {isSelected ? (
                      <span className="text-indigo-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        투표 후보로 선택됨
                      </span>
                    ) : (
                      <span className="group-hover:text-slate-700">
                        {selectedIds.length >= 3 ? '최대 3팀 선택 완료' : '터치하여 선택'}
                      </span>
                    )}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    최대 3팀 투표제
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Bar for Submission */}
      <div className="fixed bottom-6 left-0 right-0 z-30 px-4 pointer-events-none">
        <div className="max-w-xl mx-auto pointer-events-auto">
          <div className="p-3 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 ${
                selectedIds.length >= 1
                  ? 'bg-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-400'
              }`}>
                {selectedIds.length}/3
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">
                  {selectedIds.length === 0
                    ? '투표할 팀을 선택해주세요 (최대 3팀)'
                    : selectedIds.length === 3
                    ? (isEditing ? '최대 3팀 선택 완료! 재투표를 확정해주세요' : '최대 3팀 선택 완료! 투표를 제출해주세요')
                    : `${selectedIds.length}팀 선택 완료! 투표를 제출해주세요`}
                </p>
                <p className="text-[11px] text-slate-500">
                  사번 ({currentEmployeeId})으로 안전하게 집계됩니다
                </p>
              </div>
            </div>

            <button
              id="btn-submit-vote"
              type="button"
              disabled={selectedIds.length < 1 || selectedIds.length > 3}
              onClick={handleSubmit}
              className={`py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                selectedIds.length >= 1 && selectedIds.length <= 3
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 active:scale-95 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <span>
                {isEditing
                  ? `재투표 확정 (${selectedIds.length}팀)`
                  : selectedIds.length > 0
                  ? `${selectedIds.length}팀 투표 제출`
                  : '팀을 선택해주세요'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
