import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, 
  Users, 
  Vote, 
  Flame, 
  Award, 
  Sliders, 
  Play, 
  UserPlus, 
  Sparkles, 
  RotateCcw, 
  PlusCircle, 
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Percent,
  Eye,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface AdminTotalDashboardProps {
  onOpenAddModal: () => void;
  onOpenRevealCeremony: () => void;
}

export const AdminTotalDashboard: React.FC<AdminTotalDashboardProps> = ({
  onOpenAddModal,
  onOpenRevealCeremony,
}) => {
  const { 
    participants, 
    votes, 
    candidateScores, 
    updateExecutiveScore, 
    addSimulatedVotes, 
    clearAllVotes,
    resetParticipantsToDefault,
    clearAllParticipants,
    resetAllTestData,
    setUserRole,
    setActiveTab,
    setAdminSubTab
  } = useApp();

  const [simulating, setSimulating] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const [pendingConfirm, setPendingConfirm] = useState<{
    title: string;
    desc: string;
    btnLabel: string;
    btnColor: string;
    action: () => void;
  } | null>(null);

  const handleClearVotes = () => {
    clearAllVotes();
    setIsResetModalOpen(false);
    showToast('투표 데이터 및 사번 재투표 기록이 0건으로 깔끔하게 초기화되었습니다.');
  };

  const handleResetParticipants = () => {
    resetParticipantsToDefault();
    setIsResetModalOpen(false);
    showToast('참가자 및 부서 정보가 기본 6개 팀으로 복원되었습니다.');
  };

  const handleClearParticipants = () => {
    clearAllParticipants();
    setIsResetModalOpen(false);
    showToast('참가자 목록이 모두 비워졌습니다. 신규 참가팀을 등록해보세요.');
  };

  const handleMasterReset = () => {
    resetAllTestData();
    setIsResetModalOpen(false);
    showToast('전체 데이터가 새 경연대회 시작 전 상태로 완벽히 초기화되었습니다.');
  };

  const requestClearVotes = () => {
    setPendingConfirm({
      title: '투표 데이터 0건 초기화',
      desc: '모든 임직원 투표 내역과 사번별 재투표 기회를 0건으로 비웁니다. 참가팀 정보는 그대로 유지됩니다.',
      btnLabel: '투표 0건 초기화 실행',
      btnColor: 'bg-rose-600 hover:bg-rose-700',
      action: handleClearVotes,
    });
  };

  const requestResetParticipants = () => {
    setPendingConfirm({
      title: '참가자(부서·이름·주제) 기본값 복원',
      desc: '참가자 목록을 초기 기본 6팀(부서, 이름, 주제, 기본점수)으로 복원합니다.',
      btnLabel: '기본 6팀 복원 실행',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700',
      action: handleResetParticipants,
    });
  };

  const requestClearParticipants = () => {
    setPendingConfirm({
      title: '참가자 목록 전체 비우기',
      desc: '등록된 참가팀 목록을 전체 비웁니다. 새로운 부서/이름을 처음부터 직접 등록하여 테스트할 수 있습니다.',
      btnLabel: '전체 비우기 실행',
      btnColor: 'bg-slate-800 hover:bg-slate-900',
      action: handleClearParticipants,
    });
  };

  const requestMasterReset = () => {
    setPendingConfirm({
      title: '경연대회 전체 완전 초기화 (Master Reset)',
      desc: '투표 내역 0건 + 사번 재투표 기록 삭제 + 참가자 기본 6팀 복원을 한 번에 실행합니다.',
      btnLabel: '전체 완전 초기화 실행',
      btnColor: 'bg-amber-600 hover:bg-amber-700',
      action: handleMasterReset,
    });
  };

  const totalVoters = votes.length;
  const totalVotesCast = totalVoters * 3;

  // Current #1 overall candidate (Leader)
  const currentLeader = candidateScores.length > 0 ? candidateScores[0] : null;

  // Current #1 by employee votes alone
  const sortedByEmp = [...candidateScores].sort(
    (a, b) => b.employeeVotesCount - a.employeeVotesCount
  );
  const employeeFavorite = sortedByEmp.length > 0 ? sortedByEmp[0] : null;

  const handleSimulate = (count: number) => {
    setSimulating(true);
    addSimulatedVotes(count);
    setTimeout(() => setSimulating(false), 300);
  };

  const filteredScores = candidateScores.filter((s) => {
    const q = filterQuery.toLowerCase();
    return (
      s.participant.name.toLowerCase().includes(q) ||
      s.participant.topic.toLowerCase().includes(q) ||
      (s.participant.department && s.participant.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner: Admin Total Dashboard Welcome & Quick Switch */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              관리자 전용 토탈 대시보드
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              실시간 자동 집계 활성
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            경연 종합 상황실 & 점수 관리
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            임직원 실시간 투표(30%)와 경영진 심사점수(70%)를 통합 관리하고 최종 순위를 발표합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-rose-200 cursor-pointer shadow-xs"
            title="투표 및 참가자 데이터 초기화 메뉴"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>데이터 초기화</span>
          </button>

          <button
            onClick={() => setUserRole('employee')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            title="임직원 화면으로 전환하여 투표 화면 테스트"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>임직원 투표 화면 보기</span>
          </button>

          <button
            onClick={onOpenRevealCeremony}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-100" />
            <span>임직원 최종 순위 발표</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)} 
            className="p-1 text-emerald-600 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">총 투표 참여 임직원</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {totalVoters}
            <span className="text-xs font-normal text-slate-500 ml-1">명</span>
          </div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">
            총 투표권 {totalVotesCast}표 행사됨
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">등록된 참가팀</span>
            <Vote className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {participants.length}
            <span className="text-xs font-normal text-slate-500 ml-1">팀</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            1인 3표 투표 규칙 적용
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">임직원 최다 득표</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            {employeeFavorite?.employeeVotesCount || 0}
            <span className="text-xs font-normal text-slate-500 ml-1">표</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium truncate mt-1">
            {employeeFavorite?.participant.name || '-'}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">반영 산출 비율</span>
            <Percent className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            70% : 30%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            경영진 70점 + 임직원 30점
          </div>
        </div>
      </div>

      {/* FEATURED: CURRENT #1 CHAMPION SHOWCASE */}
      {currentLeader && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/60 to-indigo-50 border-2 border-amber-300 shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-black text-2xl flex flex-col items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
                <Trophy className="w-6 h-6 text-slate-950" />
                <span className="text-[10px] -mt-1 font-bold">1위 리더</span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm">
                    현재 종합 1위 대상 유력
                  </span>
                  {currentLeader.participant.department && (
                    <span className="text-xs text-slate-600 bg-white/80 px-2 py-0.5 rounded-md font-medium border border-amber-200">
                      {currentLeader.participant.department}
                    </span>
                  )}
                  {currentLeader.participant.tag && (
                    <span className="text-xs text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md font-medium">
                      {currentLeader.participant.tag}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {currentLeader.participant.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-xl font-medium">
                  {currentLeader.participant.topic}
                </p>
              </div>
            </div>

            {/* Score Pill */}
            <div className="bg-white p-4 rounded-2xl border border-amber-300 shadow-sm shrink-0 md:text-right">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                현재 종합 합산 점수
              </span>
              <div className="text-3xl font-black text-amber-600 flex items-center md:justify-end gap-1">
                <span>{currentLeader.finalScore}</span>
                <span className="text-sm font-normal text-slate-400">/ 100점</span>
              </div>
              <div className="text-xs text-slate-600 mt-1 flex items-center md:justify-end gap-2">
                <span>경영진 70%: <strong>{currentLeader.weightedExecutiveScore}점</strong></span>
                <span>•</span>
                <span>임직원 30%: <strong>{currentLeader.weightedEmployeeScore}점</strong> ({currentLeader.employeeVotesCount}표)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOTAL DASHBOARD: EXECUTIVE SCORE INPUT & RANKINGS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              참가팀 실시간 순위 및 경영진 심사점수 (70%) 입력
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              슬라이더 또는 숫자를 조정하면 경영진 70% + 임직원 30%가 실시간으로 자동 재계산되어 순위가 갱신됩니다.
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>신규 참가자 등록</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-16 text-center">순위</th>
                <th className="py-3 px-4 min-w-[180px]">참가팀 & 주제</th>
                <th className="py-3 px-4 min-w-[120px] text-center">
                  임직원 투표 (30%)
                </th>
                <th className="py-3 px-4 min-w-[220px]">
                  경영진 평가점수 (70%) 입력
                </th>
                <th className="py-3 px-4 text-right min-w-[110px]">
                  최종 점수 (합산)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredScores.map((score) => {
                const isFirst = score.rank === 1;
                const isSecond = score.rank === 2;
                const isThird = score.rank === 3;

                return (
                  <tr 
                    key={score.participant.id}
                    className={`hover:bg-indigo-50/30 transition-colors ${
                      isFirst ? 'bg-amber-50/40 font-semibold' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                          isFirst
                            ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/30'
                            : isSecond
                            ? 'bg-slate-200 text-slate-800'
                            : isThird
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {score.rank}
                      </span>
                    </td>

                    {/* Participant & Topic */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {score.participant.name}
                        </span>
                        {score.participant.department && (
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {score.participant.department}
                          </span>
                        )}
                        {score.participant.tag && (
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-medium">
                            {score.participant.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {score.participant.topic}
                      </p>
                    </td>

                    {/* Employee Votes (30%) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {score.employeeVotesCount}표
                        <span className="text-xs text-slate-400 font-normal ml-1">
                          ({score.employeeVoteRatio}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-cyan-600 font-semibold">
                        반영: +{score.weightedEmployeeScore}점
                      </div>
                    </td>

                    {/* Executive Score Input (70%) */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={score.executiveScore}
                              onChange={(e) =>
                                updateExecutiveScore(score.participant.id, Number(e.target.value))
                              }
                              className="w-14 py-1 px-2 text-center rounded-lg border border-slate-300 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <span className="text-xs text-slate-500">점</span>
                          </div>
                          <span className="text-xs font-bold text-amber-600">
                            70% 반영: +{score.weightedExecutiveScore}점
                          </span>
                        </div>

                        {/* Interactive Range Slider */}
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={score.executiveScore}
                          onChange={(e) =>
                            updateExecutiveScore(score.participant.id, Number(e.target.value))
                          }
                          className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </td>

                    {/* Final Score */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="text-base sm:text-lg font-black text-slate-900">
                        {score.finalScore}
                        <span className="text-xs font-normal text-slate-400 ml-0.5">점</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isFirst ? '🏆 1위 대상' : `${score.rank}위`}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee ID Voter Audit & Verification Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              사번별 실시간 투표 검증 내역 ({votes.length}명 참여)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              중복 및 마구잡이 투표가 없도록 각 사번(Employee ID)당 정확히 1건(3표)만 등록 및 감사됩니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              인증 사번 총 {votes.length}건
            </span>
          </div>
        </div>

        {/* Voter table */}
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-600 text-xs font-bold uppercase border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-4">사번 (Employee ID)</th>
                <th className="py-2.5 px-4">성함 / 부서</th>
                <th className="py-2.5 px-4">투표 시각</th>
                <th className="py-2.5 px-4">선택한 3개 후보팀</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {votes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    아직 투표한 임직원 사번이 없습니다.
                  </td>
                </tr>
              ) : (
                votes.map((v) => {
                  const chosenParticipants = participants.filter((p) =>
                    v.selectedParticipantIds.includes(p.id)
                  );
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-indigo-700 border border-slate-200 font-semibold text-xs">
                          {v.voterId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {v.voterName}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(v.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {chosenParticipants.map((p, idx) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                            >
                              <span className="text-[9px] text-indigo-400 mr-1">#{idx + 1}</span>
                              {p.name}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Organizer Demo Tools: Test & Data Reset Control Center */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <RotateCcw className="w-4 h-4" />
              </span>
              <h4 className="text-sm sm:text-base font-black text-slate-900">
                대회 테스트 & 데이터 초기화 센터
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              반복 테스트 및 리허설 중 누적된 투표 데이터와 참가자(부서, 이름, 주제) 정보를 원클릭으로 정리할 수 있습니다.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 self-start sm:self-center shrink-0">
            현재 투표: {totalVoters}명 ({totalVotesCast}표) / 참가팀: {participants.length}팀
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: 투표 내용 초기화 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Vote className="w-3.5 h-3.5 text-rose-600" />
                  투표 내용 초기화
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {totalVoters}명 투표됨
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                모든 임직원 투표 내역과 사번별 재투표 기회를 0건으로 완전 비웁니다. 새 사번으로 바로 투표를 테스트할 수 있습니다.
              </p>
            </div>
            <button
              onClick={requestClearVotes}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              투표 내역 0건으로 초기화
            </button>
          </div>

          {/* Card 2: 부서 & 이름 참가자 관리 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  참가자(부서·이름) 초기화
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {participants.length}팀 등록
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                참가팀의 이름, 소속 부서, 주제를 초기 기본 6팀으로 복원하거나, 직접 등록을 위해 전체 목록을 비웁니다.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={requestResetParticipants}
                className="py-2 px-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 shadow-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-indigo-600" />
                기본 6팀 복원
              </button>
              <button
                onClick={requestClearParticipants}
                className="py-2 px-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3 text-slate-500" />
                전체 비우기
              </button>
            </div>
          </div>

          {/* Card 3: 원클릭 마스터 초기화 */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  원클릭 전체 초기화
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  Master Reset
                </span>
              </div>
              <p className="text-xs text-amber-800/80 leading-relaxed">
                투표 0건 초기화 + 참가자(부서/이름) 기본 6팀 복원을 한 번에 실행하여 새 대회 시작 상태로 만듭니다.
              </p>
            </div>
            <button
              onClick={requestMasterReset}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-100" />
              전체 데이터 완전 초기화
            </button>
          </div>
        </div>

        {/* Quick Simulation Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0">
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
              가상 투표 시뮬레이션:
            </span>
            <span className="text-xs text-slate-500">
              초기화 후 대시보드 변동 및 순위 그래프를 시험할 가상 투표를 즉시 투입합니다.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSimulate(10)}
              disabled={simulating || participants.length === 0}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              +10명 투표
            </button>
            <button
              onClick={() => handleSimulate(25)}
              disabled={simulating || participants.length === 0}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              +25명 투표
            </button>
          </div>
        </div>
      </div>

      {/* Reset Modal Dialog */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                  <RotateCcw className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">데이터 초기화 선택</h3>
                  <p className="text-xs text-slate-500">원하시는 초기화 범위를 선택해주세요.</p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: 투표 내역만 초기화 */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Vote className="w-4 h-4 text-rose-600" />
                    투표 내용만 초기화 (0표)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    누적된 투표 ({totalVoters}명)와 사번별 재투표 기회를 모두 지웁니다. 참가자 정보는 유지됩니다.
                  </p>
                </div>
                <button
                  onClick={handleClearVotes}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  투표 초기화
                </button>
              </div>

              {/* Option 2: 참가자 기본값 복원 */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    참가자(부서·이름·주제) 기본값 복원
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    수정되거나 추가된 참가팀을 초기 6개 팀 기본 정보로 되돌립니다.
                  </p>
                </div>
                <button
                  onClick={handleResetParticipants}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  참가자 복원
                </button>
              </div>

              {/* Option 3: 원클릭 완전 초기화 */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    원클릭 완전 초기화 (Master Reset)
                  </h4>
                  <p className="text-xs text-amber-800/80 mt-0.5">
                    투표 0건 초기화 + 참가자 기본값 복원 + 사번 세션을 모두 초기 상태로 돌립니다.
                  </p>
                </div>
                <button
                  onClick={handleMasterReset}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white text-xs font-bold shrink-0 transition-all cursor-pointer shadow-xs"
                >
                  전체 초기화
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal (Replaces blocked window.confirm) */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {pendingConfirm.title}
                </h3>
                <span className="text-[11px] font-semibold text-rose-600">실행 확인</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {pendingConfirm.desc}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingConfirm(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => {
                  pendingConfirm.action();
                  setPendingConfirm(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer ${pendingConfirm.btnColor}`}
              >
                {pendingConfirm.btnLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
