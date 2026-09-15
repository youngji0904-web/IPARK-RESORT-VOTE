import React from 'react';
import { CandidateScore } from '../types';
import { Trophy, Medal, Crown, Sparkles, Check, ArrowRight } from 'lucide-react';

interface HeroWinnerSpotlightProps {
  score: CandidateScore;
  onDismiss: () => void;
}

export const HeroWinnerSpotlight: React.FC<HeroWinnerSpotlightProps> = ({
  score,
  onDismiss,
}) => {
  const isGrandChampion = score.rank === 1;
  const isSecondPlace = score.rank === 2;

  const rankBadgeText = isGrandChampion
    ? '👑 대상 1위 (GRAND CHAMPION)'
    : isSecondPlace
    ? '🥈 최우수상 (제 2위)'
    : '🥉 우수상 (제 3위)';

  const cardBorderClass = isGrandChampion
    ? 'border-amber-400 shadow-2xl shadow-amber-500/50 bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-950'
    : isSecondPlace
    ? 'border-slate-300 shadow-2xl shadow-slate-400/30 bg-gradient-to-b from-slate-900 via-slate-800/60 to-slate-950'
    : 'border-amber-700 shadow-2xl shadow-amber-800/30 bg-gradient-to-b from-slate-900 via-amber-950/30 to-slate-950';

  const buttonLabel = isGrandChampion
    ? '영예의 1위 단상에 올리기 (시상대 완성)'
    : isSecondPlace
    ? '2위 단상에 올리기'
    : '3위 단상에 올리기';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Radiant Glow Behind the Spotlight Card */}
      <div
        className={`absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl opacity-40 pointer-events-none ${
          isGrandChampion ? 'bg-amber-400' : isSecondPlace ? 'bg-cyan-400' : 'bg-amber-600'
        }`}
      />

      {/* Main Spotlight Card Rising from Bottom */}
      <div
        className={`relative z-10 w-full max-w-xl p-6 sm:p-10 rounded-3xl border-2 text-center overflow-hidden animate-in slide-in-from-bottom-20 zoom-in-95 duration-700 ${cardBorderClass}`}
      >
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-black text-xs sm:text-sm mb-4 shadow-sm animate-bounce">
          {isGrandChampion ? (
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
          ) : (
            <Medal className="w-4 h-4 text-amber-300" />
          )}
          <span>{rankBadgeText}</span>
        </div>

        {/* Large Trophy / Crown Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-slate-900 border-2 border-amber-400/60 shadow-xl flex items-center justify-center mb-4 text-amber-400">
          {isGrandChampion ? (
            <Trophy className="w-12 h-12 text-amber-300 fill-amber-300 animate-pulse" />
          ) : isSecondPlace ? (
            <Medal className="w-12 h-12 text-slate-200" />
          ) : (
            <Medal className="w-12 h-12 text-amber-600" />
          )}
        </div>

        {/* GIANT WINNER NAME ("누가 딱! 멋지게 이름이 딱 전체적으로 뜨고") */}
        <div className="my-2">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-tight drop-shadow-lg">
            {score.participant.name}
          </h1>
        </div>

        {/* Department and Tech Tag */}
        <div className="flex items-center justify-center gap-2 flex-wrap my-3">
          {score.participant.department && (
            <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700">
              {score.participant.department}
            </span>
          )}
          {score.participant.tag && (
            <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs sm:text-sm border border-amber-400/30">
              {score.participant.tag}
            </span>
          )}
        </div>

        {/* Project Topic */}
        <div className="my-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs sm:text-base font-medium leading-relaxed">
          "{score.participant.topic}"
        </div>

        {/* Score Breakdown Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-slate-950/80 border border-amber-400/30 mb-6">
          <div className="text-center p-2 rounded-xl bg-slate-900/60">
            <span className="block text-[10px] sm:text-xs text-slate-400 font-semibold">
              경영진 70%
            </span>
            <span className="text-sm sm:text-lg font-black text-amber-200">
              {score.weightedExecutiveScore}점
            </span>
          </div>

          <div className="text-center p-2 rounded-xl bg-slate-900/60">
            <span className="block text-[10px] sm:text-xs text-slate-400 font-semibold">
              임직원 30%
            </span>
            <span className="text-sm sm:text-lg font-black text-indigo-300">
              {score.weightedEmployeeScore}점
            </span>
            <span className="block text-[9px] text-slate-500">
              ({score.employeeVotesCount}표)
            </span>
          </div>

          <div className="text-center p-2 rounded-xl bg-amber-500/10 border border-amber-400/40">
            <span className="block text-[10px] sm:text-xs text-amber-400 font-black">
              종합 최종 점수
            </span>
            <span className="text-base sm:text-xl font-black text-amber-300 drop-shadow">
              {score.finalScore}점
            </span>
          </div>
        </div>

        {/* Automatic Celebration & Applause Status Banner */}
        <div className="mb-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-200 font-black text-xs sm:text-sm shadow-inner">
          <span className="text-base">🎉</span>
          <span>축하합니다!</span>
          <span className="text-base">👏</span>
        </div>

        {/* Action Button: Dock to Podium */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onDismiss}
            className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{buttonLabel}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-3 font-medium">
          버튼을 누르면 시상대 단상 위에 올라서며 결과를 확정합니다.
        </p>
      </div>
    </div>
  );
};
