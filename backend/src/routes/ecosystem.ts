import express from 'express';
import { AIDecisionEngine } from '../services/AIDecisionEngine';
import { BlockchainService } from '../services/BlockchainService';
import { verifyAccessToken } from '../utils/auth';

const router = express.Router();
const aiEngine = new AIDecisionEngine();
const blockchain = new BlockchainService();

// Auth middleware
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    
    const payload = verifyAccessToken(token);
    (req as any).user = { id: payload.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// AI Decision Engine Routes
router.get('/ecosystem/dashboard', requireAuth, async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const location = { lat: parseFloat(lat as string), lng: parseFloat(lng as string) };
    
    const dashboard = await aiEngine.getEcosystemDashboard(location, parseInt(radius as string) || 10);
    res.json({ success: true, dashboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

router.post('/ecosystem/analyze', requireAuth, async (req, res) => {
  try {
    const { location, metrics } = req.body;
    const recommendations = await aiEngine.analyzeEcosystem(location, metrics);
    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

router.post('/ecosystem/predict', requireAuth, async (req, res) => {
  try {
    const { hectares, scenario, timeframe } = req.body;
    const prediction = await aiEngine.generatePredictiveModel(hectares, scenario, timeframe);
    res.json({ success: true, prediction });
  } catch (error) {
    res.status(500).json({ error: 'Prediction failed' });
  }
});

// Blockchain Routes
router.post('/blockchain/mint-tokens', requireAuth, async (req, res) => {
  try {
    const { projectId, carbonCredits, recipient, metadata } = req.body;
    const token = await blockchain.mintCarbonTokens(projectId, carbonCredits, recipient, metadata);
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: 'Token minting failed' });
  }
});

router.post('/dao/proposals', requireAuth, async (req, res) => {
  try {
    const { title, description, votingDuration } = req.body;
    const userId = (req as any).user.id;
    const proposal = await blockchain.createDAOProposal(title, description, userId, votingDuration);
    res.json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ error: 'Proposal creation failed' });
  }
});

router.post('/dao/vote', requireAuth, async (req, res) => {
  try {
    const { proposalId, support } = req.body;
    const userId = (req as any).user.id;
    const tx = await blockchain.voteOnProposal(proposalId, userId, support);
    res.json({ success: true, transaction: tx });
  } catch (error) {
    res.status(500).json({ error: 'Voting failed' });
  }
});

router.get('/blockchain/portfolio/:address', requireAuth, async (req, res) => {
  try {
    const { address } = req.params;
    const portfolio = await blockchain.getUserPortfolio(address);
    res.json({ success: true, portfolio });
  } catch (error) {
    res.status(500).json({ error: 'Portfolio fetch failed' });
  }
});

export default router;