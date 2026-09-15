import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, 
  Calculator, 
  Trophy, 
  Check, 
  Sparkles, 
  Sliders, 
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export const ExecutiveEvalView: React.FC = () => {
  const { 
    participants, 
    candidateScores, 
    updateExecutiveScore, 
    batchUpdateExecutiveScores,
    setActiveTab 
  } = useApp();

  const [activeCandidateId, setActiveCandidateId] = useState<string>(
    participants[0]?.id || ''
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleScoreChange = (id: string, newScore: number) => {
    updateExecutiveScore(id, newScore);
  };

  const handleFeedbackChange = (id: string, feedback: string) => {
    const p = participants.find((item) => item.id === id);
    if (p) {
      updateExecutiveScore(id, p.executiveScore, feedback);
    }
  };

  const handlePresetScore = (id: string, score: number) => {
    soundManager.playClick();
    updateExecutiveScore(id, score);
    showToast(`${score}점으로 설정되었습니다.`);
  };

  return (
    <div className="pb-28 max-w-4xl mx-auto px-4 pt-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header formula explanation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-950 border border-amber-500/30 p-5 sm:p-6 mb-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Award className="w-3.5 h-3.5" />
            경영진 심사 평가 (가중치 70%)
          </span>
          <span className="text-xs text-slate-400">
            실시간 임직원 투표 (30%) 자동 결합
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          경영진 평가점수 입력 & 최종 환산
        </h2>

        {/* Formula Display Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-1 text-amber-400">
              <Award className="w-4 h-4" />
              <span>경영진 점수 (70%)</span>
            </div>
            <span className="text-slate-500">+</span>
            <div className="flex items-center gap-1 text-cyan-400">
              <Percent className="w-4 h-4" />
              <span>임직원 투표 (30%)</span>
            </div>
            <span className="text-slate-500">=</span>
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <Trophy className="w-4 h-4" />
              <span>최종 점수 (100점 만점)</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('reveal')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 shrink-0"
          >
            <span>순차 발표 준비 완료</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Participants Evaluation Cards */}
      <div className="space-y-4">
        {participants.map((participant) => {
          const scoreInfo = candidateScores.find((s) => s.participant.id === participant.id);
          const currentExecScore = participant.executiveScore ?? 85;

          return (
            <div
              key={participant.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
            >
              {/* Top info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {participant.name}
                    </h3>
                    {participant.department && (
                      <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {participant.department}
                      </span>
                    )}
                    {participant.tag && (
                      <span className="text-[11px] text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
                        {participant.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    {participant.topic}
                  </p>
                </div>

                {/* Score badge summary */}
                {scoreInfo && (
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
                      <span className="text-[10px] text-slate-400 block">현재 합산 순위</span>
                      <span className="text-sm font-black text-amber-400 flex items-center gap-1 justify-end">
                        <Trophy className="w-3.5 h-3.5" />
                        {scoreInfo.rank}위 ({scoreInfo.finalScore}점)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Slider & Direct Score Controls */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    경영진 심사 점수 (0 ~ 100점):
                  </label>

                  {/* Number Input & Display */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={currentExecScore}
                      onChange={(e) => handleScoreChange(participant.id, Number(e.target.value))}
                      className="w-16 py-1 px-2 text-center rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-sm focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-xs text-slate-400">점</span>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={currentExecScore}
                  onChange={(e) => handleScoreChange(participant.id, Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                {/* Quick Presets */}
                <div className="flex items-center justify-between gap-1 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-500">빠른 점수 입력:</span>
                  <div className="flex items-center gap-1.5">
                    {[95, 90, 85, 80, 75].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetScore(participant.id, preset)}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                          currentExecScore === preset
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {preset}점
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-time Math Breakdown Bar */}
                {scoreInfo && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-amber-500/20">
                      <span className="text-[10px] text-slate-400 block">경영진 70%</span>
                      <strong className="text-amber-300 text-xs sm:text-sm">
                        {scoreInfo.weightedExecutiveScore}점
                      </strong>
                      <span className="text-[10px] text-slate-500 block">
                        ({currentExecScore} × 0.7)
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/80 border border-cyan-500/20">
                      <span className="text-[10px] text-slate-400 block">임직원 30%</span>
                      <strong className="text-cyan-300 text-xs sm:text-sm">
                        {scoreInfo.weightedEmployeeScore}점
                      </strong>
                      <span className="text-[10px] text-slate-500 block">
                        ({scoreInfo.employeeVotesCount}표 · {scoreInfo.employeeVoteRatio}%)
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/80 border border-emerald-500/30 bg-emerald-950/20">
                      <span className="text-[10px] text-emerald-400 block font-semibold">최종 합산</span>
                      <strong className="text-emerald-300 text-xs sm:text-sm font-black">
                        {scoreInfo.finalScore}점
                      </strong>
                      <span className="text-[10px] text-slate-400 block">
                        예상 {scoreInfo.rank}위
                      </span>
                    </div>
                  </div>
                )}

                {/* Executive feedback comment */}
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>심사 총평 / 코멘트:</span>
                  </div>
                  <input
                    type="text"
                    value={participant.executiveFeedback || ''}
                    onChange={(e) => handleFeedbackChange(participant.id, e.target.value)}
                    placeholder="프로젝트의 기술적 독창성, 사내 업무 적용성 등에 대한 심사 코멘트 입력..."
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
