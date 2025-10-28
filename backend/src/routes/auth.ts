import { Router, Request, Response } from 'express';
import { User } from '../models';
import { verifyWalletSignature } from '../middleware/auth';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

// Generate nonce for signing
router.post('/nonce', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const nonce = Math.floor(Math.random() * 1000000).toString();
    const message = `Sign this message to authenticate with RepChain: ${nonce}`;

    res.json({ message, nonce });
  } catch (error) {
    console.error('Nonce error:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

// Login/Register with wallet signature
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    const isValid = verifyWalletSignature(message, signature, walletAddress);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find or create user
    let user = await User.findOne({ where: { walletAddress } });

    if (!user) {
      user = await User.create({ walletAddress });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, walletAddress: user.walletAddress },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        bio: user.bio,
        reputationScore: user.reputationScore
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current user profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      bio: user.bio,
      email: user.email,
      githubUsername: user.githubUsername,
      reputationScore: user.reputationScore,
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update user profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { username, bio, email } = req.body;

    await user.update({
      username: username || user.username,
      bio: bio || user.bio,
      email: email || user.email
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        bio: user.bio,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;