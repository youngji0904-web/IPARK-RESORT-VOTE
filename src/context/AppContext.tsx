import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Participant, VoteRecord, CandidateScore, ActiveTab, UserRole, AdminSubTab } from '../types';
import { INITIAL_PARTICIPANTS } from '../data/initialParticipants';
import { calculateCandidateScores } from '../utils/scoring';
import { soundManager } from '../utils/audio';

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  adminSubTab: AdminSubTab;
  setAdminSubTab: (tab: AdminSubTab) => void;
  
  // Real-time synchronization state
  isLiveConnected: boolean;
  lastSyncedAt: number;
  forceRefresh: () => Promise<void>;

  // Employee ID Auth
  currentEmployeeId: string | null;
  currentEmployeeName: string | null;
  loginEmployee: (id: string, name?: string) => void;
  logoutEmployee: () => void;
  hasEmployeeVoted: (id: string) => boolean;
  canRevote: (id: string) => boolean;
  revoteCountForEmployee: (id: string) => number;
  isLoggedOut: boolean;
  dismissLogout: () => void;

  participants: Participant[];
  votes: VoteRecord[];
  myVote: VoteRecord | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  candidateScores: CandidateScore[];
  isMuted: boolean;
  toggleSound: () => void;
  
  // Participant management (실시간 서버 전파)
  addParticipant: (participant: Omit<Participant, 'id'>) => void;
  updateParticipant: (id: string, data: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  resetParticipantsToDefault: () => void;
  clearAllParticipants: () => void;
  resetAllTestData: () => void;

  // Voting (실시간 서버 전파)
  submitVote: (selectedIds: string[], voterName?: string) => boolean;
  clearMyVote: () => void;
  addSimulatedVotes: (count: number) => void;
  clearAllVotes: () => void;

  // Executive evaluation (실시간 서버 전파)
  updateExecutiveScore: (id: string, score: number, feedback?: string) => void;
  batchUpdateExecutiveScores: (scoresMap: Record<string, number>) => void;

  // Navigation & UI helpers
  openMyVoteModal: boolean;
  setOpenMyVoteModal: (open: boolean) => void;
}

const STORAGE_KEY_PARTICIPANTS = 'vibe_participants_v1';
const STORAGE_KEY_VOTES = 'vibe_votes_v1';
const STORAGE_KEY_USER_ROLE = 'vibe_user_role_v1';
const STORAGE_KEY_CURRENT_EMPLOYEE_ID = 'vibe_emp_id_v1';
const STORAGE_KEY_CURRENT_EMPLOYEE_NAME = 'vibe_emp_name_v1';
const STORAGE_KEY_REVOTE_COUNTS = 'vibe_revote_counts_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Live connection status
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  // User Role State
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const sessionSaved = sessionStorage.getItem(STORAGE_KEY_USER_ROLE);
      if (sessionSaved === 'admin' || sessionSaved === 'employee') return sessionSaved;
    } catch {
      // fallback
    }
    return 'employee';
  });

  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('total');

  // Employee ID Auth State
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_CURRENT_EMPLOYEE_ID);
    } catch {
      return null;
    }
  });

  const [currentEmployeeName, setCurrentEmployeeName] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_CURRENT_EMPLOYEE_NAME);
    } catch {
      return null;
    }
  });

  const [revoteCounts, setRevoteCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVOTE_COUNTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);

  // Participants State: cached from localStorage then immediately synced with server
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_PARTICIPANTS;
  });

  // Votes State
  const [votes, setVotes] = useState<VoteRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOTES);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Dynamically compute myVote based on current logged in Employee ID
  const myVote = useMemo<VoteRecord | null>(() => {
    if (!currentEmployeeId) return null;
    const cleanId = currentEmployeeId.trim().toUpperCase();
    return votes.find((v) => v.voterId.trim().toUpperCase() === cleanId) || null;
  }, [votes, currentEmployeeId]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('vote');
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.isMuted());
  const [openMyVoteModal, setOpenMyVoteModal] = useState<boolean>(false);

  // Sync to local storage as fallback cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
    } catch {
      // ignore
    }
  }, [participants]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(votes));
    } catch {
      // ignore
    }
  }, [votes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVOTE_COUNTS, JSON.stringify(revoteCounts));
    } catch {
      // ignore
    }
  }, [revoteCounts]);

  useEffect(() => {
    try {
      if (currentEmployeeId) {
        localStorage.setItem(STORAGE_KEY_CURRENT_EMPLOYEE_ID, currentEmployeeId);
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_EMPLOYEE_ID);
      }
    } catch {
      // ignore
    }
  }, [currentEmployeeId]);

  useEffect(() => {
    try {
      if (currentEmployeeName) {
        localStorage.setItem(STORAGE_KEY_CURRENT_EMPLOYEE_NAME, currentEmployeeName);
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_EMPLOYEE_NAME);
      }
    } catch {
      // ignore
    }
  }, [currentEmployeeName]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_USER_ROLE, userRole);
      localStorage.removeItem(STORAGE_KEY_USER_ROLE);
    } catch {
      // ignore
    }
  }, [userRole]);

  // -------------------------------------------------------------
  // Real-time synchronization with Backend Server (Mobile Optimized)
  // -------------------------------------------------------------
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(Date.now());
  const lastFetchTimeRef = useRef<number>(0);

  const fetchServerState = useCallback(async (isManual: boolean = false) => {
    try {
      const now = Date.now();
      lastFetchTimeRef.current = now;
      // High-entropy cache buster + no-cache headers to defeat aggressive mobile caching
      const res = await fetch(`/api/state?_t=${now}&_r=${Math.floor(Math.random() * 100000)}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.participants)) {
          setParticipants(data.participants);
        }
        if (Array.isArray(data.votes)) {
          setVotes(data.votes);
        }
        if (data.revoteCounts && typeof data.revoteCounts === 'object') {
          setRevoteCounts(data.revoteCounts);
        }
        setIsLiveConnected(true);
        setLastSyncedAt(Date.now());
      }
    } catch (err) {
      console.warn('[Sync] Server state fetch warning:', err);
    }
  }, []);

  const forceRefresh = useCallback(async () => {
    soundManager.playSelect();
    await fetchServerState(true);
  }, [fetchServerState]);

  useEffect(() => {
    // 1. Initial immediate fetch
    fetchServerState();

    // 2. Server-Sent Events (SSE) with auto-reconnection for mobile
    let eventSource: EventSource | null = null;
    let sseReconnectTimer: NodeJS.Timeout | null = null;

    const setupSSE = () => {
      if (eventSource) {
        try {
          eventSource.close();
        } catch {
          // ignore
        }
      }
      try {
        eventSource = new EventSource('/api/events');
        eventSource.onopen = () => {
          setIsLiveConnected(true);
        };
        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'SYNC' && payload.data) {
              if (Array.isArray(payload.data.participants)) {
                setParticipants(payload.data.participants);
              }
              if (Array.isArray(payload.data.votes)) {
                setVotes(payload.data.votes);
              }
              if (payload.data.revoteCounts && typeof payload.data.revoteCounts === 'object') {
                setRevoteCounts(payload.data.revoteCounts);
              }
              setIsLiveConnected(true);
              setLastSyncedAt(Date.now());
            }
          } catch {
            // heartbeat or ping
          }
        };
        eventSource.onerror = () => {
          setIsLiveConnected(false);
          // Try reconnect after 2.5s for mobile connections
          if (sseReconnectTimer) clearTimeout(sseReconnectTimer);
          sseReconnectTimer = setTimeout(() => {
            setupSSE();
          }, 2500);
        };
      } catch {
        // Fallback to rapid polling
      }
    };

    setupSSE();

    // 3. High-frequency active polling (1.2 seconds)
    // Ensures sub-second live updates on all mobile devices even if SSE is suspended by OS/Browser
    const pollInterval = setInterval(() => {
      fetchServerState();
    }, 1200);

    // 4. Mobile Lifecycle & Interaction Handlers (iOS Safari / Android Chrome)
    const handleForegroundWakeup = () => {
      fetchServerState();
      setupSSE();
    };

    const handleUserTouch = () => {
      // If user touches the screen and more than 1.2s has passed since last fetch, sync immediately
      if (Date.now() - lastFetchTimeRef.current > 1200) {
        fetchServerState();
      }
    };

    window.addEventListener('visibilitychange', handleForegroundWakeup);
    window.addEventListener('pageshow', handleForegroundWakeup);
    window.addEventListener('focus', handleForegroundWakeup);
    window.addEventListener('online', handleForegroundWakeup);
    window.addEventListener('touchstart', handleUserTouch, { passive: true });

    return () => {
      if (eventSource) {
        try {
          eventSource.close();
        } catch {}
      }
      if (sseReconnectTimer) clearTimeout(sseReconnectTimer);
      clearInterval(pollInterval);
      window.removeEventListener('visibilitychange', handleForegroundWakeup);
      window.removeEventListener('pageshow', handleForegroundWakeup);
      window.removeEventListener('focus', handleForegroundWakeup);
      window.removeEventListener('online', handleForegroundWakeup);
      window.removeEventListener('touchstart', handleUserTouch);
    };
  }, [fetchServerState]);

  const toggleSound = useCallback(() => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  }, []);

  // Candidate Scores Memoized
  const candidateScores = useMemo(() => {
    return calculateCandidateScores(participants, votes);
  }, [participants, votes]);

  // -------------------------------------------------------------
  // Actions (Optimistic Local + Server Persistence & SSE Broadcast)
  // -------------------------------------------------------------
  const addParticipant = useCallback((data: Omit<Participant, 'id'>) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-purple-500 to-pink-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-red-600',
      'from-cyan-500 to-blue-600',
      'from-violet-500 to-purple-600',
    ];
    const newParticipant: Participant = {
      ...data,
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      avatarColor: data.avatarColor || colors[Math.floor(Math.random() * colors.length)],
      executiveScore: data.executiveScore ?? 85,
    };

    setParticipants((prev) => [...prev, newParticipant]);
    soundManager.playClick();

    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newParticipant),
    }).catch((err) => console.error('[API Error] addParticipant:', err));
  }, []);

  const updateParticipant = useCallback((id: string, data: Partial<Participant>) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    soundManager.playClick();

    fetch(`/api/participants/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((err) => console.error('[API Error] updateParticipant:', err));
  }, []);

  const deleteParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setVotes((prev) =>
      prev.map((v) => ({
        ...v,
        selectedParticipantIds: v.selectedParticipantIds.filter((pid) => pid !== id),
      }))
    );
    soundManager.playClick();

    fetch(`/api/participants/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch((err) => console.error('[API Error] deleteParticipant:', err));
  }, []);

  const resetParticipantsToDefault = useCallback(() => {
    setParticipants(INITIAL_PARTICIPANTS);
    soundManager.playClick();

    fetch('/api/participants/reset', {
      method: 'POST',
    }).catch((err) => console.error('[API Error] resetParticipantsToDefault:', err));
  }, []);

  const clearAllParticipants = useCallback(() => {
    setParticipants([]);
    soundManager.playClick();

    fetch('/api/participants/clear', {
      method: 'POST',
    }).catch((err) => console.error('[API Error] clearAllParticipants:', err));
  }, []);

  const loginEmployee = useCallback((id: string, name?: string) => {
    const cleanId = id.trim();
    if (!cleanId) return;
    setCurrentEmployeeId(cleanId);
    const resolvedName = name?.trim() || `임직원 (${cleanId})`;
    setCurrentEmployeeName(resolvedName);
    setIsLoggedOut(false);
    soundManager.playSelect();
  }, []);

  const logoutEmployee = useCallback(() => {
    setCurrentEmployeeId(null);
    setCurrentEmployeeName(null);
    setIsLoggedOut(true);
    soundManager.playClick();
  }, []);

  const dismissLogout = useCallback(() => {
    setIsLoggedOut(false);
  }, []);

  const hasEmployeeVoted = useCallback((id: string) => {
    const clean = id.trim().toUpperCase();
    return votes.some((v) => v.voterId.trim().toUpperCase() === clean);
  }, [votes]);

  const canRevote = useCallback((id: string) => {
    const clean = id.trim().toUpperCase();
    const count = revoteCounts[clean] || 0;
    return count < 1;
  }, [revoteCounts]);

  const revoteCountForEmployee = useCallback((id: string) => {
    const clean = id.trim().toUpperCase();
    return revoteCounts[clean] || 0;
  }, [revoteCounts]);

  const submitVote = useCallback((selectedIds: string[], voterName?: string): boolean => {
    if (selectedIds.length !== 3) return false;

    const targetVoterId = currentEmployeeId || `240000`;
    const targetVoterName = currentEmployeeName || voterName || `임직원 (${targetVoterId})`;
    const cleanVoterId = targetVoterId.trim().toUpperCase();

    const alreadyVotedBefore = votes.some(
      (v) => v.voterId.trim().toUpperCase() === cleanVoterId
    );

    let newRevoteCount = revoteCounts[cleanVoterId] || 0;
    if (alreadyVotedBefore) {
      newRevoteCount += 1;
      setRevoteCounts((prev) => ({ ...prev, [cleanVoterId]: newRevoteCount }));
    }

    const newRecord: VoteRecord = {
      id: `vote-${cleanVoterId}-${Date.now()}`,
      voterId: cleanVoterId,
      voterName: targetVoterName,
      selectedParticipantIds: selectedIds,
      timestamp: Date.now(),
      revoteCount: newRevoteCount,
    };

    setVotes((prev) => {
      const filtered = prev.filter((v) => v.voterId.trim().toUpperCase() !== cleanVoterId);
      return [newRecord, ...filtered];
    });

    soundManager.playVoteSuccess();

    fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedIds,
        voterId: cleanVoterId,
        voterName: targetVoterName,
      }),
    }).catch((err) => console.error('[API Error] submitVote:', err));

    return true;
  }, [currentEmployeeId, currentEmployeeName, votes, revoteCounts]);

  const clearMyVote = useCallback(() => {
    if (!currentEmployeeId) return;
    const cleanId = currentEmployeeId.trim().toUpperCase();
    setVotes((prev) => prev.filter((v) => v.voterId.trim().toUpperCase() !== cleanId));
    soundManager.playClick();

    fetch(`/api/votes/${encodeURIComponent(cleanId)}`, {
      method: 'DELETE',
    }).catch((err) => console.error('[API Error] clearMyVote:', err));
  }, [currentEmployeeId]);

  const addSimulatedVotes = useCallback((count: number) => {
    soundManager.playSelect();
    fetch('/api/votes/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    }).catch((err) => console.error('[API Error] addSimulatedVotes:', err));
  }, []);

  const clearAllVotes = useCallback(() => {
    setVotes([]);
    setRevoteCounts({});
    soundManager.playClick();

    fetch('/api/votes', {
      method: 'DELETE',
    }).catch((err) => console.error('[API Error] clearAllVotes:', err));
  }, []);

  const resetAllTestData = useCallback(() => {
    setParticipants(INITIAL_PARTICIPANTS);
    setVotes([]);
    setRevoteCounts({});
    setCurrentEmployeeId(null);
    setCurrentEmployeeName(null);
    soundManager.playClick();

    fetch('/api/reset-all', {
      method: 'POST',
    }).catch((err) => console.error('[API Error] resetAllTestData:', err));
  }, []);

  const updateExecutiveScore = useCallback((id: string, score: number, feedback?: string) => {
    const clamped = Math.max(0, Math.min(100, Math.round(score)));
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            executiveScore: clamped,
            executiveFeedback: feedback !== undefined ? feedback : p.executiveFeedback,
          };
        }
        return p;
      })
    );

    fetch(`/api/participants/${encodeURIComponent(id)}/executive-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: clamped, feedback }),
    }).catch((err) => console.error('[API Error] updateExecutiveScore:', err));
  }, []);

  const batchUpdateExecutiveScores = useCallback((scoresMap: Record<string, number>) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (scoresMap[p.id] !== undefined) {
          return {
            ...p,
            executiveScore: Math.max(0, Math.min(100, Math.round(scoresMap[p.id]))),
          };
        }
        return p;
      })
    );
    soundManager.playClick();

    fetch('/api/participants/batch-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scoresMap }),
    }).catch((err) => console.error('[API Error] batchUpdateExecutiveScores:', err));
  }, []);

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        adminSubTab,
        setAdminSubTab,
        isLiveConnected,
        lastSyncedAt,
        forceRefresh,
        currentEmployeeId,
        currentEmployeeName,
        loginEmployee,
        logoutEmployee,
        hasEmployeeVoted,
        canRevote,
        revoteCountForEmployee,
        isLoggedOut,
        dismissLogout,
        participants,
        votes,
        myVote,
        activeTab,
        setActiveTab,
        candidateScores,
        isMuted,
        toggleSound,
        addParticipant,
        updateParticipant,
        deleteParticipant,
        resetParticipantsToDefault,
        clearAllParticipants,
        resetAllTestData,
        submitVote,
        clearMyVote,
        addSimulatedVotes,
        clearAllVotes,
        updateExecutiveScore,
        batchUpdateExecutiveScores,
        openMyVoteModal,
        setOpenMyVoteModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
