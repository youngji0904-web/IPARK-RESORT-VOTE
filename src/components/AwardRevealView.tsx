import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, 
  Sparkles, 
  Crown, 
  Medal, 
  RotateCcw, 
  ArrowLeft,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Monitor,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { DrumRoll3DStage } from './DrumRoll3DStage';
import { HeroWinnerSpotlight } from './HeroWinnerSpotlight';
import { CandidateScore } from '../types';

export const AwardRevealView: React.FC = () => {
  const { candidateScores, setAdminSubTab, isMuted, toggleSound } = useApp();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Top 3 sorted candidates (Rank 1, 2, 3)
  const sortedScores = [...candidateScores].sort((a, b) => a.rank - b.rank);
  const rank1 = sortedScores.find((c) => c.rank === 1) || sortedScores[0] || null;
  const rank2 = sortedScores.find((c) => c.rank === 2) || sortedScores[1] || null;
  const rank3 = sortedScores.find((c) => c.rank === 3) || sortedScores[2] || null;

  // Reveal order: 3위 -> 2위 -> 1위
  // revealStep:
  // 0: None revealed (all 3 podiums waiting)
  // 1: 3위 revealed and standing on the 3rd place podium
  // 2: 2위 revealed and standing on the 2nd place podium (2위 + 3위 on podium)
  // 3: 1위 revealed and standing on 1st place podium (All 1, 2, 3 complete on podium!)
  const [revealStep, setRevealStep] = useState<number>(0);

  // Ceremony phases:
  // 'idle' -> Waiting for user to click next rank
  // 'drum_approaching' -> 3D drum comes forward with snare roll & lively left-right sway
  // 'drum_swooshing' -> Drum rapidly swooshes away into background
  // 'hero_spotlight' -> Winner rises up with grand fanfare & full screen spotlight
  const [ceremonyPhase, setCeremonyPhase] = useState<'idle' | 'drum_approaching' | 'drum_swooshing' | 'hero_spotlight'>('idle');
  const [tensionCountdown, setTensionCountdown] = useState<number>(5);
  const [targetRankToReveal, setTargetRankToReveal] = useState<number | null>(null);
  const [activeSpotlightScore, setActiveSpotlightScore] = useState<CandidateScore | null>(null);

  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const swooshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start grand ceremony ambient BGM when entering reveal view, and stop on unmount
  useEffect(() => {
    if (!isMuted) {
      soundManager.startCeremonyBgm();
    }
    return () => {
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
      if (swooshTimeoutRef.current) clearTimeout(swooshTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      soundManager.stopSuspenseDrumroll();
      soundManager.stopCeremonyBgm();
      soundManager.stopCrowdApplause();
    };
  }, [isMuted]);

  const triggerWinnerConfetti = () => {
    try {
      confetti({
        particleCount: 180,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#ffffff', '#6366f1', '#eab308'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 120,
          angle: 60,
          spread: 85,
          origin: { x: 0 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff'],
        });
        confetti({
          particleCount: 120,
          angle: 120,
          spread: 85,
          origin: { x: 1 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff'],
        });
      }, 350);
    } catch {
      // ignore
    }
  };

  const triggerSubtleConfetti = (colors: string[]) => {
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.7 },
        colors,
      });
    } catch {
      // ignore
    }
  };

  // Skip drum countdown and jump directly to hero spotlight
  const skipRevealImmediate = () => {
    if (ceremonyPhase === 'idle' || targetRankToReveal === null) return;
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    if (swooshTimeoutRef.current) clearTimeout(swooshTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    soundManager.stopSuspenseDrumroll();

    const target = targetRankToReveal;
    const winner = target === 1 ? rank1 : target === 2 ? rank2 : rank3;

    soundManager.playWhoosh();
    setCeremonyPhase('drum_swooshing');

    setTimeout(() => {
      if (winner) {
        setActiveSpotlightScore(winner);
        setCeremonyPhase('hero_spotlight');

        if (target === 1) {
          soundManager.playWinnerFanfare();
          triggerWinnerConfetti();
        } else if (target === 2) {
          soundManager.playDramaticReveal();
          triggerSubtleConfetti(['#cbd5e1', '#94a3b8', '#ffffff', '#60a5fa']);
        } else {
          soundManager.playDramaticReveal();
          triggerSubtleConfetti(['#d97706', '#b45309', '#fbbf24', '#f59e0b']);
        }
      }
    }, 250);
  };

  const handleRevealNext = () => {
    if (ceremonyPhase !== 'idle' || revealStep >= 3) return;

    // Sequence: 3위 -> 2위 -> 1위
    const nextRank = revealStep === 0 ? 3 : revealStep === 1 ? 2 : 1;
    const winner = nextRank === 1 ? rank1 : nextRank === 2 ? rank2 : rank3;

    if (!winner) return;

    setTargetRankToReveal(nextRank);
    setCeremonyPhase('drum_approaching');

    // Dynamic duration: snappy and punchy (~4.8s - 5.0s for all ranks so it grows immediately)
    const totalDurationMs = nextRank === 1 ? 5000 : nextRank === 2 ? 4800 : 4800;
    const swooshLeadTimeMs = 450;
    const approachDurationMs = totalDurationMs - swooshLeadTimeMs;

    const initialSeconds = Math.round(totalDurationMs / 1000);
    setTensionCountdown(initialSeconds);

    soundManager.playSuspenseDrumroll(totalDurationMs);

    let currentSec = initialSeconds;
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      currentSec -= 1;
      setTensionCountdown(Math.max(0, currentSec));
      if (currentSec <= 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    // Phase 1 -> Phase 2: Drum swooshes away ("휙 뒤로 숨고")
    if (swooshTimeoutRef.current) clearTimeout(swooshTimeoutRef.current);
    swooshTimeoutRef.current = setTimeout(() => {
      soundManager.playWhoosh();
      setCeremonyPhase('drum_swooshing');
    }, approachDurationMs);

    // Phase 2 -> Phase 3: Winner rises up in full screen spotlight ("크게 딱!")
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    revealTimeoutRef.current = setTimeout(() => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setActiveSpotlightScore(winner);
      setCeremonyPhase('hero_spotlight');

      if (nextRank === 1) {
        soundManager.playWinnerFanfare();
        triggerWinnerConfetti();
      } else if (nextRank === 2) {
        soundManager.playDramaticReveal();
        triggerSubtleConfetti(['#cbd5e1', '#94a3b8', '#ffffff', '#60a5fa']);
      } else {
        soundManager.playDramaticReveal();
        triggerSubtleConfetti(['#d97706', '#b45309', '#fbbf24', '#f59e0b']);
      }
    }, totalDurationMs);
  };

  // Called when presenter clicks "발표 바로가기" in the spotlight
  const handleDismissSpotlight = () => {
    soundManager.playClick();
    const currentTarget = targetRankToReveal;
    const nextStep = revealStep + 1;
    setRevealStep(nextStep);
    setCeremonyPhase('idle');
    setActiveSpotlightScore(null);
    setTargetRankToReveal(null);

    // Extra celebration when the podium is fully completed with 1st place!
    if (currentTarget === 1 || nextStep >= 3) {
      triggerWinnerConfetti();
    }
  };

  const resetReveal = () => {
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    if (swooshTimeoutRef.current) clearTimeout(swooshTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    soundManager.stopSuspenseDrumroll();
    setRevealStep(0);
    setCeremonyPhase('idle');
    setActiveSpotlightScore(null);
    setTargetRankToReveal(null);
    soundManager.playClick();
  };

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFs = Boolean(
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      );
      if (!isNativeFs && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const toggleFullscreenMode = async () => {
    soundManager.playClick();
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        const target = containerRef.current || document.documentElement;
        if (target.requestFullscreen) {
          await target.requestFullscreen();
        } else if ((target as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (target as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        }
      } catch {
        // Fallback to in-window fixed viewport fullscreen
      }
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
          await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
        }
      } catch {
        // ignore
      }
    }
  };

  const allTop3Revealed = revealStep >= 3;
  const isDrumActive = ceremonyPhase === 'drum_approaching' || ceremonyPhase === 'drum_swooshing';

  // Action button label with natural Korean
  const actionButtonText = isDrumActive
    ? '두구두구두구... 🥁'
    : revealStep === 0
    ? '순위 발표 시작 (3위 발표 🥁)'
    : revealStep === 1
    ? '다음 순위 보기 (2위 발표 🥁)'
    : '대망의 1위 발표 (👑 팡파레)';

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 overflow-y-auto bg-slate-950 p-4 sm:p-8 flex flex-col justify-start min-h-screen animate-in fade-in duration-200'
          : 'pb-32 max-w-5xl mx-auto px-3 sm:px-4 pt-2'
      }
    >
      {/* Top Bar: Return Button & Controls */}
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        {!isFullscreen ? (
          <button
            onClick={() => setAdminSubTab('total')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>토탈 대시보드로 돌아가기</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Monitor className="w-3.5 h-3.5 text-amber-400" />
              전체화면 무대 발표 모드
            </span>
          </div>
        )}

        {/* Fullscreen & Audio Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">음소거 해제</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">사운드 켬</span>
              </>
            )}
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreenMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
              isFullscreen
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 ring-2 ring-amber-300/40'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>전체화면 종료 (ESC)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>전체화면 발표 모드</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Dramatic Festival Arena (Dark Luxury Festival Theme) */}
      <div className={`rounded-3xl bg-slate-950 border border-amber-500/30 p-5 sm:p-8 text-white relative overflow-hidden shadow-2xl ${
        isFullscreen ? 'w-full max-w-6xl mx-auto my-auto ring-1 ring-amber-500/20' : ''
      }`}>
        {/* Background Atmosphere: Spotlights & Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-72 bg-radial from-amber-500/25 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-24 left-1/4 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 right-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Title */}
        <div className="relative z-10 text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/30 mb-2.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>IPARK리조트 AI 바이브코딩 경진대회</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-tight">
            영예의 최종 순위 발표
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
            경영진 평가 <strong className="text-amber-300 font-bold">70%</strong> + 임직원 투표 <strong className="text-indigo-300 font-bold">30%</strong> 종합 최종 순위
          </p>

          {/* Reveal Action Button */}
          <div className="mt-6 flex items-center justify-center gap-3">
            {!allTop3Revealed ? (
              <button
                id="btn-reveal-next-rank"
                onClick={handleRevealNext}
                disabled={isDrumActive}
                className={`py-3.5 px-8 sm:px-10 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                  isDrumActive
                    ? 'bg-amber-400 text-slate-950 scale-105 animate-pulse shadow-amber-400/40'
                    : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/30 ring-2 ring-amber-300/40'
                }`}
              >
                <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
                <span>{actionButtonText}</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <div className="py-2.5 px-5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-xs sm:text-sm flex items-center gap-2 shadow-inner">
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>모든 순위 발표가 완료되었습니다! 수상을 축하합니다!</span>
                </div>
                <button
                  onClick={resetReveal}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>순위 발표 다시하기</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3D DRUMROLL STAGE ("3d처럼 드럼이 움직이면서 두구두구 하면서 앞에 오다가 휙 뒤로 숨고") */}
        {/* ========================================================= */}
        {isDrumActive && targetRankToReveal !== null && (
          <div className="my-6">
            <DrumRoll3DStage
              phase={ceremonyPhase === 'drum_approaching' ? 'approaching' : 'swooshing'}
              targetRank={targetRankToReveal}
              countdown={tensionCountdown}
              initialCountdown={5}
              onSkip={skipRevealImmediate}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* HERO WINNER SPOTLIGHT ("누가 딱! 멋지게 이름이 딱 전체적으로 뜨고") */}
        {/* ========================================================= */}
        {ceremonyPhase === 'hero_spotlight' && activeSpotlightScore && (
          <HeroWinnerSpotlight
            score={activeSpotlightScore}
            onDismiss={handleDismissSpotlight}
          />
        )}

        {/* ========================================================= */}
        {/* 3-TIER PODIUM STAGE (시상대 단상) */}
        {/* 3위 발표 -> 단상에 3위 올라감 */}
        {/* 2위 발표 -> 단상에 2위 올라감 */}
        {/* 1위 발표 -> 빵빠레와 축하포 후 단상에 1위 올라감 */}
        {/* 마지막에는 전체 1, 2, 3위가 단상 형태로 완성! */}
        {/* ========================================================= */}
        <div className="relative z-10 pt-4 sm:pt-6">
          <div className="text-center mb-3">
            <span className="text-xs font-bold text-amber-300/80 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              {revealStep === 0 && '시상대 단상 (3위 발표 준비 중)'}
              {revealStep === 1 && '🥉 3위 발표 완료 · 2위 발표 대기 중'}
              {revealStep === 2 && '🥈 2위 & 🥉 3위 발표 완료 · 👑 대망의 1위 발표 대기 중'}
              {revealStep >= 3 && '🏆 TOP 3 AI 바이브 코딩 명예의 전당'}
            </span>
          </div>

          {/* Podium Grid (Left: 2위, Center: 1위 Highest, Right: 3위) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-5 items-end max-w-4xl mx-auto pt-4">
            {/* ================================================= */}
            {/* 2위 최우수상 단상 (Left, Silver) */}
            {/* ================================================= */}
            <div className="flex flex-col items-center justify-end">
              {/* Top Winner Card or Placeholder */}
              <div className="w-full mb-2">
                {revealStep >= 2 && rank2 ? (
                  <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900 border-2 border-slate-300 shadow-xl shadow-slate-500/20 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-slate-200 text-slate-900 font-black text-lg flex items-center justify-center shadow-md mb-2 border border-white">
                      <Medal className="w-5 h-5 text-slate-800" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 border border-slate-500">
                      🥈 최우수상 (2위)
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white mt-1.5 line-clamp-1">
                      {rank2.participant.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {rank2.participant.department}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 hidden sm:block">
                      {rank2.participant.topic}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-slate-700/80 flex items-center justify-between text-[11px] px-1">
                      <span className="text-slate-400">종합</span>
                      <span className="font-black text-slate-200 text-sm">{rank2.finalScore}점</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-700 text-center flex flex-col items-center justify-center min-h-[140px] sm:min-h-[180px]">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-sm font-black mb-2">
                      ?
                    </div>
                    <span className="text-[11px] text-slate-500 font-bold">2위 최우수상</span>
                    <span className="text-[10px] text-slate-600 mt-1">발표 대기 중</span>
                  </div>
                )}
              </div>

              {/* 2위 Pedestal Block (단상 기둥) */}
              <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 border-t-4 border-x-2 border-slate-400 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-white/40" />
                <span className="text-4xl sm:text-6xl font-black text-slate-400/50 drop-shadow">
                  2
                </span>
                <span className="text-[10px] sm:text-xs font-black text-slate-300 tracking-wider uppercase mt-1">
                  2ND PLACE
                </span>
              </div>
            </div>

            {/* ================================================= */}
            {/* 1위 대상 단상 (Center, Gold, Highest) */}
            {/* ================================================= */}
            <div className="flex flex-col items-center justify-end -mt-4 sm:-mt-6">
              {/* Top Winner Card or Placeholder */}
              <div className="w-full mb-2">
                {revealStep >= 3 && rank1 ? (
                  <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-amber-500/25 via-slate-900 to-slate-950 border-2 border-amber-300 shadow-2xl shadow-amber-500/40 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-400/20 rounded-full blur-lg pointer-events-none" />

                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/50 mb-2 border-2 border-amber-200 animate-bounce duration-1000">
                      <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-slate-950 fill-slate-950" />
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-md">
                      <Trophy className="w-3 h-3 fill-slate-950" />
                      👑 1위 대상 (GRAND CHAMPION)
                    </span>

                    <h3 className="text-lg sm:text-2xl font-black text-amber-200 mt-2 tracking-tight line-clamp-1">
                      {rank1.participant.name}
                    </h3>
                    
                    <p className="text-[10px] sm:text-xs text-slate-300 font-medium mt-0.5 line-clamp-1">
                      {rank1.participant.department}
                    </p>
                    <p className="text-[10px] sm:text-xs text-amber-200/80 font-medium mt-0.5 line-clamp-1 hidden sm:block">
                      "{rank1.participant.topic}"
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-amber-400/40 flex items-center justify-between text-xs px-1">
                      <span className="text-amber-300/80 font-bold">최종 종합</span>
                      <span className="font-black text-amber-300 text-base sm:text-lg">{rank1.finalScore}점</span>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 sm:p-6 rounded-3xl border border-dashed text-center flex flex-col items-center justify-center min-h-[160px] sm:min-h-[220px] ${
                    revealStep === 2
                      ? 'border-amber-400/70 bg-amber-500/10 animate-pulse shadow-lg shadow-amber-500/20'
                      : 'border-slate-700 bg-slate-900/40'
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black mb-2 ${
                      revealStep === 2
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      <Crown className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-black ${revealStep === 2 ? 'text-amber-300' : 'text-slate-500'}`}>
                      👑 영예의 1위
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      {revealStep === 2 ? '발표 준비 완료!' : '발표 대기 중'}
                    </span>
                  </div>
                )}
              </div>

              {/* 1위 Pedestal Block (가장 높은 단상 기둥) */}
              <div className="w-full h-36 sm:h-48 rounded-t-2xl bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 border-t-4 border-x-2 border-amber-300 shadow-2xl shadow-amber-500/30 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-yellow-200/70" />
                <span className="text-5xl sm:text-7xl font-black text-amber-200/50 drop-shadow">
                  1
                </span>
                <span className="text-[10px] sm:text-xs font-black text-amber-200 tracking-wider uppercase mt-1">
                  1ST PLACE
                </span>
              </div>
            </div>

            {/* ================================================= */}
            {/* 3위 우수상 단상 (Right, Bronze, Lowest) */}
            {/* ================================================= */}
            <div className="flex flex-col items-center justify-end">
              {/* Top Winner Card or Placeholder */}
              <div className="w-full mb-2">
                {revealStep >= 1 && rank3 ? (
                  <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-950/50 to-slate-900 border-2 border-amber-700 shadow-xl shadow-amber-900/30 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-amber-700 text-white font-black text-lg flex items-center justify-center shadow-md mb-2 border border-amber-500">
                      <Medal className="w-5 h-5 text-amber-200" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700">
                      🥉 우수상 (3위)
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white mt-1.5 line-clamp-1">
                      {rank3.participant.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {rank3.participant.department}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 hidden sm:block">
                      {rank3.participant.topic}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-amber-800/60 flex items-center justify-between text-[11px] px-1">
                      <span className="text-slate-400">종합</span>
                      <span className="font-black text-amber-300 text-sm">{rank3.finalScore}점</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-700 text-center flex flex-col items-center justify-center min-h-[140px] sm:min-h-[180px]">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-sm font-black mb-2">
                      ?
                    </div>
                    <span className="text-[11px] text-slate-500 font-bold">3위 우수상</span>
                    <span className="text-[10px] text-slate-600 mt-1">발표 대기 중</span>
                  </div>
                )}
              </div>

              {/* 3위 Pedestal Block (단상 기둥) */}
              <div className="w-full h-24 sm:h-30 rounded-t-2xl bg-gradient-to-b from-amber-800 via-amber-900 to-slate-900 border-t-4 border-x-2 border-amber-600 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-amber-400/30" />
                <span className="text-4xl sm:text-5xl font-black text-amber-600/50 drop-shadow">
                  3
                </span>
                <span className="text-[10px] sm:text-xs font-black text-amber-300 tracking-wider uppercase mt-1">
                  3RD PLACE
                </span>
              </div>
            </div>
          </div>

          {/* Solid Stage Base Floor Underneath the 3 Pedestals */}
          <div className="max-w-4xl mx-auto h-5 sm:h-6 rounded-b-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700 shadow-2xl relative">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
          </div>
        </div>

        {/* Bottom Celebration Badge When Completed */}
        {allTop3Revealed && (
          <div className="mt-8 text-center animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>IPARK리조트 AI 바이브코딩 경진대회 시상이 모두 완료되었습니다.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
