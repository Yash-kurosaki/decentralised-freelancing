import { Router, Response } from 'express';
import { User } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateGitHubConnect } from '../middleware/validation';
import { GitHubService } from '../services/githubService';
import { ReputationService } from '../services/reputationService';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Connect GitHub account
router.post('/connect', validateGitHubConnect, async (req: AuthRequest, res: Response) => {
  try {
    const { githubUsername } = req.body;
    const userId = req.user!.id;

    // Verify GitHub account exists
    const verified = await GitHubService.verifyOwnership(
      githubUsername,
      req.user!.walletAddress
    );

    if (!verified) {
      return res.status(404).json({ error: 'GitHub account not found or unable to verify' });
    }

    // Update user with GitHub username
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if GitHub username is already connected to another account
    const existingUser = await User.findOne({ 
      where: { githubUsername } 
    });
    
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ 
        error: 'This GitHub account is already connected to another wallet' 
      });
    }

    await user.update({ githubUsername });

    // Recalculate reputation with GitHub data
    const newReputation = await ReputationService.updateUserReputation(userId);

    res.json({
      message: 'GitHub account connected successfully',
      githubUsername,
      reputationScore: newReputation
    });
  } catch (error) {
    console.error('GitHub connect error:', error);
    res.status(500).json({ 
      error: 'Failed to connect GitHub account',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Disconnect GitHub account
router.post('/disconnect', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.githubUsername) {
      return res.status(400).json({ error: 'No GitHub account connected' });
    }

    await user.update({ 
      githubUsername: null as any,
      githubAccessToken: null as any
    });

    // Recalculate reputation without GitHub data
    const newReputation = await ReputationService.updateUserReputation(userId);

    res.json({
      message: 'GitHub account disconnected successfully',
      reputationScore: newReputation
    });
  } catch (error) {
    console.error('GitHub disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect GitHub account' });
  }
});

// Get GitHub profile stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id);

    if (!user || !user.githubUsername) {
      return res.status(404).json({ error: 'GitHub account not connected' });
    }

    const stats = await GitHubService.calculateStats(user.githubUsername);
    const profile = await GitHubService.getUserProfile(user.githubUsername);

    res.json({
      profile: {
        username: profile.login,
        name: profile.name,
        avatar: profile.avatar_url,
        followers: profile.followers,
        following: profile.following
      },
      stats
    });
  } catch (error) {
    console.error('GitHub stats error:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub stats' });
  }
});

// Refresh GitHub data and recalculate reputation
router.post('/refresh', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await User.findByPk(userId);

    if (!user || !user.githubUsername) {
      return res.status(404).json({ error: 'GitHub account not connected' });
    }

    // Recalculate reputation
    const newReputation = await ReputationService.updateUserReputation(userId);

    res.json({
      message: 'GitHub data refreshed successfully',
      reputationScore: newReputation
    });
  } catch (error) {
    console.error('GitHub refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh GitHub data' });
  }
});

export default router;