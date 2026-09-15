import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Participant, VoteRecord } from './src/types';
import { INITIAL_PARTICIPANTS } from './src/data/initialParticipants';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'competition_state.json');

function generateInitialMockVotes(participantsList: Participant[]): VoteRecord[] {
  if (participantsList.length < 3) return [];
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
  const pIds = participantsList.map((p) => p.id);

  return mockNames.map((mockUser, idx) => {
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

// In-memory store
let currentParticipants: Participant[] = [];
let currentVotes: VoteRecord[] = [];
let currentRevoteCounts: Record<string, number> = {};

// Load saved data or initialize
function loadStateFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.participants)) {
        currentParticipants = parsed.participants;
        currentVotes = Array.isArray(parsed.votes) ? parsed.votes : [];
        currentRevoteCounts = parsed.revoteCounts || {};
        console.log(`[Storage] Loaded ${currentParticipants.length} participants and ${currentVotes.length} votes from disk.`);
        return;
      }
    }
  } catch (err) {
    console.warn('[Storage] Could not read existing storage file, initializing new state:', err);
  }

  // Fallback initial state
  currentParticipants = [...INITIAL_PARTICIPANTS];
  currentVotes = generateInitialMockVotes(currentParticipants);
  currentRevoteCounts = {};
  saveStateToDisk();
}

function saveStateToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const data = {
      participants: currentParticipants,
      votes: currentVotes,
      revoteCounts: currentRevoteCounts,
      updatedAt: Date.now(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Error saving state to disk:', err);
  }
}

// SSE clients
const sseClients = new Set<express.Response>();

function broadcastState() {
  const payload = JSON.stringify({
    type: 'SYNC',
    data: {
      participants: currentParticipants,
      votes: currentVotes,
      revoteCounts: currentRevoteCounts,
    },
  });
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  loadStateFromDisk();

  const app = express();
  app.use(express.json());

  // -------------------------------------------------------------
  // SSE Real-time Stream
  // -------------------------------------------------------------
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Send immediate current state
    const initialPayload = JSON.stringify({
      type: 'SYNC',
      data: {
        participants: currentParticipants,
        votes: currentVotes,
        revoteCounts: currentRevoteCounts,
      },
    });
    res.write(`data: ${initialPayload}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Keep-alive heartbeat every 15 seconds
  setInterval(() => {
    for (const client of sseClients) {
      try {
        client.write(': keepalive\n\n');
      } catch {
        sseClients.delete(client);
      }
    }
  }, 15000);

  // -------------------------------------------------------------
  // REST API Endpoints
  // -------------------------------------------------------------
  app.get('/api/state', (req, res) => {
    res.json({
      participants: currentParticipants,
      votes: currentVotes,
      revoteCounts: currentRevoteCounts,
    });
  });

  // Add participant
  app.post('/api/participants', (req, res) => {
    const data = req.body;
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
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: (data.name || '').trim(),
      topic: (data.topic || '').trim(),
      department: data.department?.trim() || undefined,
      tag: data.tag?.trim() || 'AI Vibe App',
      avatarColor: data.avatarColor || colors[Math.floor(Math.random() * colors.length)],
      executiveScore: typeof data.executiveScore === 'number' ? data.executiveScore : 85,
      executiveFeedback: data.executiveFeedback || undefined,
    };

    currentParticipants = [...currentParticipants, newParticipant];
    saveStateToDisk();
    broadcastState();
    res.json({ success: true, participant: newParticipant });
  });

  // Update participant
  app.put('/api/participants/:id', (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    let found = false;
    currentParticipants = currentParticipants.map((p) => {
      if (p.id === id) {
        found = true;
        return {
          ...p,
          ...updateData,
          id: p.id, // prevent id mutation
        };
      }
      return p;
    });

    if (!found) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    saveStateToDisk();
    broadcastState();
    res.json({ success: true, participant: currentParticipants.find((p) => p.id === id) });
  });

  // Delete participant
  app.delete('/api/participants/:id', (req, res) => {
    const { id } = req.params;
    currentParticipants = currentParticipants.filter((p) => p.id !== id);

    // Clean up votes referencing deleted participant
    currentVotes = currentVotes.map((v) => ({
      ...v,
      selectedParticipantIds: v.selectedParticipantIds.filter((pid) => pid !== id),
    }));

    saveStateToDisk();
    broadcastState();
    res.json({ success: true });
  });

  // Reset participants to initial 6
  app.post('/api/participants/reset', (req, res) => {
    currentParticipants = [...INITIAL_PARTICIPANTS];
    saveStateToDisk();
    broadcastState();
    res.json({ success: true, participants: currentParticipants });
  });

  // Clear all participants
  app.post('/api/participants/clear', (req, res) => {
    currentParticipants = [];
    currentVotes = currentVotes.map((v) => ({ ...v, selectedParticipantIds: [] }));
    saveStateToDisk();
    broadcastState();
    res.json({ success: true });
  });

  // Update executive score
  app.post('/api/participants/:id/executive-score', (req, res) => {
    const { id } = req.params;
    const { score, feedback } = req.body;
    const clamped = Math.max(0, Math.min(100, Math.round(score)));

    currentParticipants = currentParticipants.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          executiveScore: clamped,
          executiveFeedback: feedback !== undefined ? feedback : p.executiveFeedback,
        };
      }
      return p;
    });

    saveStateToDisk();
    broadcastState();
    res.json({ success: true });
  });

  // Batch update executive scores
  app.post('/api/participants/batch-scores', (req, res) => {
    const { scoresMap } = req.body as { scoresMap: Record<string, number> };
    if (scoresMap) {
      currentParticipants = currentParticipants.map((p) => {
        if (scoresMap[p.id] !== undefined) {
          return {
            ...p,
            executiveScore: Math.max(0, Math.min(100, Math.round(scoresMap[p.id]))),
          };
        }
        return p;
      });
    }

    saveStateToDisk();
    broadcastState();
    res.json({ success: true });
  });

  // Submit / edit vote
  app.post('/api/votes', (req, res) => {
    const { selectedIds, voterId, voterName } = req.body;
    if (!Array.isArray(selectedIds) || selectedIds.length !== 3) {
      return res.status(400).json({ success: false, message: 'Must select exactly 3 participants' });
    }

    const cleanVoterId = (voterId || '240000').trim().toUpperCase();
    const cleanVoterName = (voterName || `임직원 (${cleanVoterId})`).trim();

    const alreadyVotedBefore = currentVotes.some(
      (v) => v.voterId.trim().toUpperCase() === cleanVoterId
    );

    let newRevoteCount = currentRevoteCounts[cleanVoterId] || 0;
    if (alreadyVotedBefore) {
      newRevoteCount += 1;
      currentRevoteCounts[cleanVoterId] = newRevoteCount;
    }

    const newVoteRecord: VoteRecord = {
      id: `vote-${cleanVoterId}-${Date.now()}`,
      voterId: cleanVoterId,
      voterName: cleanVoterName,
      selectedParticipantIds: selectedIds,
      timestamp: Date.now(),
      revoteCount: newRevoteCount,
    };

    // Replace any existing vote with this voterId (1 vote per employee)
    currentVotes = [newVoteRecord, ...currentVotes.filter((v) => v.voterId.trim().toUpperCase() !== cleanVoterId)];

    saveStateToDisk();
    broadcastState();
    res.json({ success: true, vote: newVoteRecord });
  });

  // Clear vote for employee
  app.delete('/api/votes/:voterId', (req, res) => {
    const cleanId = req.params.voterId.trim().toUpperCase();
    currentVotes = currentVotes.filter((v) => v.voterId.trim().toUpperCase() !== cleanId);
    saveStateToDisk();
    broadcastState();
    res.json({ success: true });
  });

  // Add simulated votes
  app.post('/api/votes/simulate', (req, res) => {
    const count = typeof req.body.count === 'number' ? req.body.count : 5;
    if (currentParticipants.length < 3) {
      return res.status(400).json({ success: false, message: 'Need at least 3 participants to simulate votes' });
    }

    const departments = ['개발팀', '디자인팀', '기획팀', '마케팅', 'HR팀', '재무팀', '영업1팀', 'AI추진TF'];
    const pIds = currentParticipants.map((p) => p.id);
    const newVotes: VoteRecord[] = [];

    for (let i = 0; i < count; i++) {
      const randomDept = departments[Math.floor(Math.random() * departments.length)];
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

    currentVotes = [...newVotes, ...currentVotes];
    saveStateToDisk();
    broadcastState();
    res.json({ success: true, count: newVotes.length });
  });

  // Clear all votes
  app.delete('/api/votes', (req, res) => {
    currentVotes = [];
    currentRevoteCounts = {};
    saveStateToDisk();
    broadcastState();
    res.json({ success: true });
  });

  // Reset all test data
  app.post('/api/reset-all', (req, res) => {
    currentParticipants = [...INITIAL_PARTICIPANTS];
    currentVotes = [];
    currentRevoteCounts = {};
    saveStateToDisk();
    broadcastState();
    res.json({ success: true });
  });

  // -------------------------------------------------------------
  // Vite Middleware & Static Production Serving
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Live Real-time Competition Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
