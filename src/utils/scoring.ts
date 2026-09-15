import { Participant, VoteRecord, CandidateScore } from '../types';

/**
 * Calculates candidate scores based on:
 * - Executive Score: 70% weight (Max 70 pts)
 * - Employee Votes: 30% weight (Max 30 pts)
 *   Normalized based on percentage of voting participants that chose this candidate (0 ~ 100 pts)
 */
export function calculateCandidateScores(
  participants: Participant[],
  votes: VoteRecord[]
): CandidateScore[] {
  const totalVoters = votes.length;
  const voteCounts: Record<string, number> = {};

  // Initialize vote counts
  participants.forEach((p) => {
    voteCounts[p.id] = 0;
  });

  // Tally votes
  votes.forEach((record) => {
    record.selectedParticipantIds.forEach((pid) => {
      if (voteCounts[pid] !== undefined) {
        voteCounts[pid] += 1;
      }
    });
  });

  // Calculate scores for each candidate
  const scores: CandidateScore[] = participants.map((p) => {
    const count = voteCounts[p.id] || 0;
    
    // Normalized employee score (0 - 100)
    // If there are voters, ratio of voters who endorsed this candidate (votes / totalVoters * 100)
    // If no voters yet, score is 0
    const ratio = totalVoters > 0 ? (count / totalVoters) * 100 : 0;
    const normalizedEmployeeScore = Math.min(100, Math.round(ratio * 10) / 10);
    const weightedEmployeeScore = Math.round(normalizedEmployeeScore * 0.3 * 10) / 10;

    const executiveScore = Math.max(0, Math.min(100, Number(p.executiveScore) || 0));
    const weightedExecutiveScore = Math.round(executiveScore * 0.7 * 10) / 10;

    const finalScore = Math.round((weightedExecutiveScore + weightedEmployeeScore) * 10) / 10;

    return {
      participant: p,
      employeeVotesCount: count,
      employeeVoteRatio: Math.round(ratio * 10) / 10,
      normalizedEmployeeScore,
      weightedEmployeeScore,
      executiveScore,
      weightedExecutiveScore,
      finalScore,
      rank: 1, // calculated below
      employeeRank: 1,
      executiveRank: 1,
    };
  });

  // Determine ranks
  // 1. Employee rank
  const sortedByEmp = [...scores].sort((a, b) => b.employeeVotesCount - a.employeeVotesCount);
  sortedByEmp.forEach((item, idx) => {
    const found = scores.find((s) => s.participant.id === item.participant.id);
    if (found) found.employeeRank = idx + 1;
  });

  // 2. Executive rank
  const sortedByExec = [...scores].sort((a, b) => b.executiveScore - a.executiveScore);
  sortedByExec.forEach((item, idx) => {
    const found = scores.find((s) => s.participant.id === item.participant.id);
    if (found) found.executiveRank = idx + 1;
  });

  // 3. Final rank: finalScore desc -> tiebreaker: executiveScore desc -> employeeVotesCount desc
  scores.sort((a, b) => {
    if (b.finalScore !== a.finalScore) {
      return b.finalScore - a.finalScore;
    }
    if (b.executiveScore !== a.executiveScore) {
      return b.executiveScore - a.executiveScore;
    }
    return b.employeeVotesCount - a.employeeVotesCount;
  });

  scores.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return scores;
}
