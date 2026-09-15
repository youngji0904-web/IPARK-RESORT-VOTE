import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle2, Trophy, BarChart3, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const MyVoteSummaryModal: React.FC = () => {
  const { 
    openMyVoteModal, 
    setOpenMyVoteModal, 
    myVote, 
    participants, 
    candidateScores, 
    clearMyVote,
    canRevote
  } = useApp();

  const [confirmingRevote, setConfirmingRevote] = React.useState(false);

  if (!openMyVoteModal || !myVote) return null;

  const revoteAllowed = myVote.voterId ? canRevote(myVote.voterId) : false;

  const votedParticipants = participants.filter((p) =>
    myVote.selectedParticipantIds.includes(p.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-slate-900">내가 선택한 3팀</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  사번: {myVote.voterId}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {myVote.voterName && `${myVote.voterName} • `}
                {new Date(myVote.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 투표 완료
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              setOpenMyVoteModal(false);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
          {votedParticipants.map((participant, index) => {
            const scoreInfo = candidateScores.find((s) => s.participant.id === participant.id);
            return (
              <div
                key={participant.id}
                className="p-3.5 rounded-2xl bg-white border border-indigo-100 hover:border-indigo-300 transition-all flex items-start gap-3 shadow-xs"
              >
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-200">
                  {index + 1}픽
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-black text-sm text-slate-900">{participant.name}</span>
                    {participant.department && (
                      <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        {participant.department}
                      </span>
                    )}
                    {participant.tag && (
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-bold">
                        {participant.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {participant.topic}
                  </p>

                  {/* Score pill */}
                  {scoreInfo && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                        실시간 임직원 {scoreInfo.employeeVotesCount}표 ({scoreInfo.employeeVoteRatio}%)
                      </span>
                      <span className="font-bold text-amber-600 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" />
                        현재 {scoreInfo.rank}위
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setOpenMyVoteModal(false);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            확인 완료
          </button>

          {revoteAllowed ? (
            confirmingRevote ? (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded-xl p-1.5 animate-in fade-in">
                <span className="text-[11px] font-bold text-amber-900 px-2">재투표하시겠습니까? (1회 제한)</span>
                <button
                  onClick={() => setConfirmingRevote(false)}
                  className="px-2 py-1 rounded-lg bg-white text-slate-600 text-xs font-bold border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    clearMyVote();
                    setOpenMyVoteModal(false);
                    setConfirmingRevote(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  재투표 진행
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingRevote(true)}
                className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                다시 투표하기 (1회 가능)
              </button>
            )
          ) : (
            <div className="py-2 px-3 rounded-xl bg-slate-100 text-slate-500 text-[11px] font-medium flex items-center justify-center">
              재투표 기회 소진 (최종 완료)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
