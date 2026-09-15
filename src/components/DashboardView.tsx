import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Users, 
  Vote, 
  Trophy, 
  CheckCircle2, 
  Sparkles, 
  PlusCircle, 
  RotateCcw, 
  TrendingUp, 
  ArrowRight,
  Flame,
  PieChart,
  AlertTriangle
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export const DashboardView: React.FC = () => {
  const { 
    votes, 
    participants, 
    myVote, 
    candidateScores, 
    setActiveTab, 
    addSimulatedVotes, 
    clearAllVotes,
    setOpenMyVoteModal 
  } = useApp();

  const [simulating, setSimulating] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const totalVoters = votes.length;
  const totalVotesCast = totalVoters * 3;

  // Sort candidates by employee vote count desc for the employee voting dashboard
  const sortedByEmployeeVotes = [...candidateScores].sort(
    (a, b) => b.employeeVotesCount - a.employeeVotesCount
  );

  const maxVotes = sortedByEmployeeVotes.length > 0 ? sortedByEmployeeVotes[0].employeeVotesCount : 1;

  const handleSimulateVotes = (count: number) => {
    setSimulating(true);
    addSimulatedVotes(count);
    setTimeout(() => setSimulating(false), 300);
  };

  return (
    <div className="pb-28 max-w-4xl mx-auto px-4 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 border border-cyan-800/80 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              LIVE 실시간 집계
            </span>
            <span className="text-xs text-slate-400">
              전체 반영 비중: 임직원 30%
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            임직원 투표 실시간 현황 대시보드
          </h2>
        </div>

        {/* Action to Executive & Reveal */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('executive')}
            className="text-xs px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700/60 font-medium transition-colors"
          >
            경영진 심사 (70%)
          </button>
          <button
            onClick={() => setActiveTab('reveal')}
            className="text-xs px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1"
          >
            <Trophy className="w-3.5 h-3.5" />
            최종 순위 발표
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">투표 참여 임직원</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {totalVoters}
            <span className="text-xs font-normal text-slate-400 ml-1">명</span>
          </div>
          <div className="text-[11px] text-cyan-400 font-medium mt-1">
            총 투표권 {totalVotesCast}표 행사
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">경연 참가팀</span>
            <Vote className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {participants.length}
            <span className="text-xs font-normal text-slate-400 ml-1">팀</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            1인당 3팀 선택제
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">현재 1위 득표수</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-300">
            {sortedByEmployeeVotes[0]?.employeeVotesCount || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">표</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-1">
            {sortedByEmployeeVotes[0]?.participant.name || '-'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">내 투표 현황</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300">
            {myVote ? '투표완료' : '미투표'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {myVote ? (
              <button 
                onClick={() => setOpenMyVoteModal(true)}
                className="text-emerald-400 underline hover:text-emerald-300"
              >
                내 선택 3팀 보기
              </button>
            ) : (
              <button 
                onClick={() => setActiveTab('vote')}
                className="text-cyan-400 underline hover:text-cyan-300"
              >
                지금 투표하기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MY VOTED PICKS HIGHLIGHT BANNER */}
      {myVote && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/40 to-slate-900 border border-indigo-500/40 shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">내가 뽑은 3팀의 실시간 성적표</h3>
            </div>
            <button
              onClick={() => setOpenMyVoteModal(true)}
              className="text-xs text-cyan-300 hover:underline font-medium"
            >
              상세보기
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {myVote.selectedParticipantIds.map((pid, idx) => {
              const cand = candidateScores.find((c) => c.participant.id === pid);
              if (!cand) return null;
              return (
                <div
                  key={pid}
                  className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                      내 {idx + 1}픽
                    </span>
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      임직원 {cand.employeeRank}위
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-100 truncate mt-1">
                    {cand.participant.name}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {cand.participant.topic}
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      득표수: <strong className="text-white">{cand.employeeVotesCount}표</strong>
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      지지도 {cand.employeeVoteRatio}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Real-time Candidate Ranking & Vote Breakdown */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              실시간 임직원 득표 현황 순위 (30% 반영)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            총 {participants.length}팀 경합 중
          </span>
        </div>

        <div className="space-y-4">
          {sortedByEmployeeVotes.map((score, index) => {
            const isMyPick = myVote?.selectedParticipantIds.includes(score.participant.id);
            const myPickIndex = myVote ? myVote.selectedParticipantIds.indexOf(score.participant.id) : -1;
            const barPercentage = maxVotes > 0 ? (score.employeeVotesCount / maxVotes) * 100 : 0;

            return (
              <div
                key={score.participant.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isMyPick
                    ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-950/40'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank Badge */}
                    <span
                      className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                        index === 0
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                          : index === 1
                          ? 'bg-slate-300 text-slate-950'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-100 truncate">
                          {score.participant.name}
                        </span>
                        {isMyPick && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-400/30 animate-pulse">
                            내가 뽑음 ({myPickIndex + 1}픽) ★
                          </span>
                        )}
                        {score.participant.department && (
                          <span className="text-[11px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {score.participant.department}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {score.participant.topic}
                      </p>
                    </div>
                  </div>

                  {/* Vote Count & Percent */}
                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-black text-cyan-300">
                      {score.employeeVotesCount}
                      <span className="text-xs font-normal text-slate-400 ml-1">표</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      지지도 {score.employeeVoteRatio}%
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      index === 0
                        ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                        : isMyPick
                        ? 'bg-gradient-to-r from-cyan-400 to-indigo-500'
                        : 'bg-gradient-to-r from-slate-500 to-indigo-600'
                    }`}
                    style={{ width: `${Math.max(4, barPercentage)}%` }}
                  />
                </div>

                {/* Scores breakdown snippet */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>
                    환산 점수: <strong className="text-slate-200">{score.normalizedEmployeeScore}점</strong> (30% 반영시 <strong>{score.weightedEmployeeScore}점</strong>)
                  </span>
                  <span className="text-slate-500">
                    경영진 평가점수: {score.executiveScore}점 (70% 반영시 {score.weightedExecutiveScore}점)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Simulation Controls (Organizers can simulate audience voting live!) */}
      <div className="rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-slate-200">
              경진대회 현장 시연용: 가상 임직원 투표 부스트
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            발표장 즉석 시연 및 테스트용
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          실제 행사장에서 여러 임직원이 동시 투표하는 상황을 손쉽게 시뮬레이션할 수 있습니다. 3개씩 무작위 표가 분배되어 실시간 그래프가 즉각 갱신됩니다.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSimulateVotes(10)}
            disabled={simulating}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            +10명 투표 추가
          </button>
          <button
            onClick={() => handleSimulateVotes(25)}
            disabled={simulating}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            +25명 투표 추가
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs font-medium px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-700/60 transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            투표 데이터 초기화
          </button>
        </div>
      </div>

      {/* In-App Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-white leading-tight">
                  투표 데이터 0건 초기화
                </h3>
                <span className="text-[11px] font-semibold text-rose-400">실행 확인</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              모든 임직원 투표 내역과 사번별 재투표 기회를 0건으로 완전 초기화하시겠습니까? (참여자 목록은 유지됩니다)
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => {
                  clearAllVotes();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                초기화 실행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
