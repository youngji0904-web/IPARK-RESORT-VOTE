import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Participant, VoteRecord, CandidateScore, ActiveTab, UserRole, AdminSubTab } from '../types';
import { INITIAL_PARTICIPANTS } from '../data/initialParticipants';
import { calculateCandidateScores } from '../utils/scoring';
import { soundManager } from '../utils/audio';

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  adminSubTab: AdminSubTab;
  setAdminSubTab: (tab: AdminSubTab) => void;
  
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
  
  // Participant management
  addParticipant: (participant: Omit<Participant, 'id'>) => void;
  updateParticipant: (id: string, data: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  resetParticipantsToDefault: () => void;
  clearAllParticipants: () => void;
  resetAllTestData: () => void;

  // Voting
  submitVote: (selectedIds: string[], voterName?: string) => boolean;
  clearMyVote: () => void;
  addSimulatedVotes: (count: number) => void;
  clearAllVotes: () => void;

  // Executive evaluation
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

// Initial mock votes to show a lively dashboard on first open
function generateInitialMockVotes(participants: Participant[]): VoteRecord[] {
  if (participants.length < 3) return [];
  const mockNames = [
    { id: '240001', name: '이수진 책임' },
    { id: '240002', name: '박민우 수석' },
    { id: '240003', name: '한정우 프로' },
    { id: '240004', name: '송지혜 매니저' },
    { id: '240005', name: '오승훈 책임' },
    { id: '240006', name: '배하은 사원' },
    { id: '240007', name: '조현우 프로' },
    { id: '240008', name: '임나경 수석' },
  ];
  const pIds = participants.map((p) => p.id);

  return mockNames.map((mockUser, idx) => {
    // Pick 3 random
    const shuffled = [...pIds].sort(() => 0.5 - Math.random());
    return {
      id: `vote-init-${idx + 1}`,
      voterId: mockUser.id,
      voterName: mockUser.name,
      selectedParticipantIds: shuffled.slice(0, 3),
      timestamp: Date.now() - (mockNames.length - idx) * 1000 * 60 * 3,
      revoteCount: 0,
    };
  });
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User Role State: 'employee' by default; admin role uses sessionStorage so it resets on reconnect/new tab
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

  // Participants State
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
      if (localStorage.getItem('vibe_has_initialized') === 'true') {
        return [];
      }
    } catch {
      // fallback
    }
    return generateInitialMockVotes(INITIAL_PARTICIPANTS);
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

  // Sync to localStorage
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
      // Clean up legacy localStorage key to ensure admin logs out on browser restart/reconnect
      localStorage.removeItem(STORAGE_KEY_USER_ROLE);
    } catch {
      // ignore
    }
  }, [userRole]);

  // Sync across browser tabs with BroadcastChannel
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('vibe_competition_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE') {
          if (event.data.participants) setParticipants(event.data.participants);
          if (event.data.votes) setVotes(event.data.votes);
        }
      };
    } catch {
      // BroadcastChannel not available in all contexts
    }

    return () => {
      if (bc) bc.close();
    };
  }, []);

  const broadcastChange = useCallback((updatedParts?: Participant[], updatedVotes?: VoteRecord[]) => {
    try {
      const bc = new BroadcastChannel('vibe_competition_channel');
      bc.postMessage({
        type: 'SYNC_STATE',
        participants: updatedParts,
        votes: updatedVotes,
      });
      bc.close();
    } catch {
      // ignore
    }
  }, []);

  const toggleSound = useCallback(() => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  }, []);

  // Candidate Scores Memoized
  const candidateScores = useMemo(() => {
    return calculateCandidateScores(participants, votes);
  }, [participants, votes]);

  // Actions
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
    setParticipants((prev) => {
      const next = [...prev, newParticipant];
      broadcastChange(next, undefined);
      return next;
    });
    soundManager.playClick();
  }, [broadcastChange]);

  const updateParticipant = useCallback((id: string, data: Partial<Participant>) => {
    setParticipants((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      broadcastChange(next, undefined);
      return next;
    });
    soundManager.playClick();
  }, [broadcastChange]);

  const deleteParticipant = useCallback((id: string) => {
    setParticipants((prev) => {
      const next = prev.filter((p) => p.id !== id);
      broadcastChange(next, undefined);
      return next;
    });
    // Also remove from votes
    setVotes((prev) => {
      const next = prev.map((v) => ({
        ...v,
        selectedParticipantIds: v.selectedParticipantIds.filter((pid) => pid !== id),
      }));
      broadcastChange(undefined, next);
      return next;
    });
    soundManager.playClick();
  }, [broadcastChange]);

  const resetParticipantsToDefault = useCallback(() => {
    setParticipants(INITIAL_PARTICIPANTS);
    try {
      localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(INITIAL_PARTICIPANTS));
    } catch {
      // ignore
    }
    broadcastChange(INITIAL_PARTICIPANTS, undefined);
    soundManager.playClick();
  }, [broadcastChange]);

  const clearAllParticipants = useCallback(() => {
    setParticipants([]);
    try {
      localStorage.removeItem(STORAGE_KEY_PARTICIPANTS);
    } catch {
      // ignore
    }
    broadcastChange([], undefined);
    soundManager.playClick();
  }, [broadcastChange]);

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
    // Exactly 1 revote opportunity allowed (count === 0 means revote is still available!)
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

    // Check if this voter already voted once
    const alreadyVotedBefore = votes.some(
      (v) => v.voterId.trim().toUpperCase() === cleanVoterId
    );

    let newRevoteCount = revoteCounts[cleanVoterId] || 0;
    if (alreadyVotedBefore) {
      newRevoteCount += 1;
      setRevoteCounts((prev) => {
        const next = { ...prev, [cleanVoterId]: newRevoteCount };
        try {
          localStorage.setItem(STORAGE_KEY_REVOTE_COUNTS, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }

    const newRecord: VoteRecord = {
      id: `vote-${targetVoterId}-${Date.now()}`,
      voterId: targetVoterId,
      voterName: targetVoterName,
      selectedParticipantIds: selectedIds,
      timestamp: Date.now(),
      revoteCount: newRevoteCount,
    };

    setVotes((prev) => {
      // Strictly replace any existing vote with the same voterId (1 vote per Employee ID)
      const filtered = prev.filter(
        (v) => v.voterId.trim().toUpperCase() !== cleanVoterId
      );
      const next = [newRecord, ...filtered];
      broadcastChange(undefined, next);
      return next;
    });

    soundManager.playVoteSuccess();
    return true;
  }, [currentEmployeeId, currentEmployeeName, votes, revoteCounts, broadcastChange]);

  const clearMyVote = useCallback(() => {
    if (!currentEmployeeId) return;
    const cleanId = currentEmployeeId.trim().toUpperCase();
    setVotes((prev) => {
      const next = prev.filter((v) => v.voterId.trim().toUpperCase() !== cleanId);
      broadcastChange(undefined, next);
      return next;
    });
    soundManager.playClick();
  }, [currentEmployeeId, broadcastChange]);

  const addSimulatedVotes = useCallback((count: number) => {
    if (participants.length < 3) return;
    const departments = ['개발팀', '디자인팀', '기획팀', '마케팅', 'HR팀', '재무팀', '영업1팀', 'AI추진TF'];
    const pIds = participants.map((p) => p.id);
    const newVotes: VoteRecord[] = [];

    for (let i = 0; i < count; i++) {
      const randomDept = departments[Math.floor(Math.random() * departments.length)];
      // Weighted random selection: pick 3 distinct
      const shuffled = [...pIds].sort(() => 0.5 - Math.random());
      const chosen = shuffled.slice(0, 3);
      newVotes.push({
        id: `sim-vote-${Date.now()}-${i}`,
        voterId: `sim-voter-${Date.now()}-${i}`,
        voterName: `${randomDept} 임직원 #${Math.floor(100 + Math.random() * 900)}`,
        selectedParticipantIds: chosen,
        timestamp: Date.now() - Math.floor(Math.random() * 60000),
      });
    }

    setVotes((prev) => {
      const next = [...newVotes, ...prev];
      broadcastChange(undefined, next);
      return next;
    });
    soundManager.playSelect();
  }, [participants, broadcastChange]);

  const clearAllVotes = useCallback(() => {
    setVotes([]);
    setRevoteCounts({});
    try {
      localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_REVOTE_COUNTS, JSON.stringify({}));
      localStorage.setItem('vibe_has_initialized', 'true');
    } catch {
      // ignore
    }
    broadcastChange(undefined, []);
    soundManager.playClick();
  }, [broadcastChange]);

  const resetAllTestData = useCallback(() => {
    setParticipants(INITIAL_PARTICIPANTS);
    setVotes([]);
    setRevoteCounts({});
    setCurrentEmployeeId(null);
    setCurrentEmployeeName(null);
    try {
      localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(INITIAL_PARTICIPANTS));
      localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_REVOTE_COUNTS, JSON.stringify({}));
      localStorage.removeItem(STORAGE_KEY_CURRENT_EMPLOYEE_ID);
      localStorage.removeItem(STORAGE_KEY_CURRENT_EMPLOYEE_NAME);
      localStorage.setItem('vibe_has_initialized', 'true');
    } catch {
      // ignore
    }
    broadcastChange(INITIAL_PARTICIPANTS, []);
    soundManager.playClick();
  }, [broadcastChange]);

  const updateExecutiveScore = useCallback((id: string, score: number, feedback?: string) => {
    const clamped = Math.max(0, Math.min(100, Math.round(score)));
    setParticipants((prev) => {
      const next = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            executiveScore: clamped,
            executiveFeedback: feedback !== undefined ? feedback : p.executiveFeedback,
          };
        }
        return p;
      });
      broadcastChange(next, undefined);
      return next;
    });
  }, [broadcastChange]);

  const batchUpdateExecutiveScores = useCallback((scoresMap: Record<string, number>) => {
    setParticipants((prev) => {
      const next = prev.map((p) => {
        if (scoresMap[p.id] !== undefined) {
          return {
            ...p,
            executiveScore: Math.max(0, Math.min(100, Math.round(scoresMap[p.id]))),
          };
        }
        return p;
      });
      broadcastChange(next, undefined);
      return next;
    });
    soundManager.playClick();
  }, [broadcastChange]);

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        adminSubTab,
        setAdminSubTab,
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
