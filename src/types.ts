export interface Participant {
  id: string;
  name: string; // 참가자 이름 / 팀명
  topic: string; // 프로젝트 주제 및 설명
  department?: string; // 소속 부서
  tag?: string; // 핵심 기술 태그 (예: Gemini Agent, Claude Code, Vibe AI 등)
  avatarColor?: string; // 고유 컬러
  executiveScore: number; // 0 ~ 100 경영진 평가 점수
  executiveFeedback?: string; // 심사평
}

export interface VoteRecord {
  id: string;
  voterId: string; // 사번 (Employee ID: 6자리 24XXXX)
  voterName: string; // 성함
  selectedParticipantIds: string[]; // 최대 3팀 (1~3팀 선택)
  timestamp: number;
  revoteCount?: number; // 재투표 횟수 (최대 1회 허용, 즉 총 2회 투표 제출 시 재투표 불가)
}

export interface CandidateScore {
  participant: Participant;
  employeeVotesCount: number; // 득표수
  employeeVoteRatio: number; // 전체 투표 대비 비율 (%)
  normalizedEmployeeScore: number; // 100점 만점 환산 점수 (30% 반영 대상)
  weightedEmployeeScore: number; // 임직원 반영 점수 (normalized * 0.3)
  executiveScore: number; // 경영진 원점수 (0~100)
  weightedExecutiveScore: number; // 경영진 반영 점수 (executiveScore * 0.7)
  finalScore: number; // 최종 합산 점수 (70% + 30%)
  rank: number; // 최종 순위 (1위부터)
  employeeRank: number; // 임직원 투표 순위
  executiveRank: number; // 경영진 평가 순위
}

export type UserRole = 'employee' | 'admin';
export type AdminSubTab = 'total' | 'reveal' | 'manage';
export type ActiveTab = 'vote' | 'dashboard' | 'executive' | 'reveal' | 'manage';
