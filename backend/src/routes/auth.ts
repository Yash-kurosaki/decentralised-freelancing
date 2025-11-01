import { Router, Request, Response } from 'express';
import { User } from '../models';
import { verifyWalletSignature, authenticate, AuthRequest } from '../middleware/auth';
import { validateWalletAddress, validateSignature, validateProfileUpdate } from '../middleware/validation';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

// Generate nonce for signing
router.post('/nonce', validateWalletAddress, async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    const nonce = Math.floor(Math.random() * 1000000).toString();
    const message = `Sign this message to authenticate with RepChain: ${nonce}`;

    res.json({ message, nonce });
  } catch (error) {
    console.error('Nonce error:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

// Login/Register with wallet signature
router.post('/login', validateWalletAddress, validateSignature, async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Verify signature
    const isValid = verifyWalletSignature(message, signature, walletAddress);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find or create user
    let user = await User.findOne({ where: { walletAddress } });

    if (!user) {
      user = await User.create({ walletAddress });
      console.log(`✅ New user created: ${walletAddress}`);
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
        email: user.email,
        reputationScore: user.reputationScore,
        githubUsername: user.githubUsername
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current user profile
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    console.log("🔥 /me route hit (diagnostic version)");

    const user = await User.findByPk(1);

    if (!user) {
      console.log("⚠️ No user found with ID 1");
      return res.status(404).json({ error: 'User not found' });
    }

    const data = {
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      bio: user.bio,
      email: user.email,
      githubUsername: user.githubUsername,
      reputationScore: user.reputationScore,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    };

    console.log("🧠 Sending user data:", data);

    // Explicitly send it as JSON
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(data));
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});




// Update user profile
router.put('/profile', validateProfileUpdate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user?.id || 1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { username, bio, email } = req.body;

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    await user.update({
      username: username !== undefined ? username: user.username,
      bio: bio!== undefined ? bio: user.bio,
      email: email !== undefined ? email : user.email,
    });

    await user.reload();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        bio: user.bio,
        email: user.email,
        reputationScore:user.reputationScore,
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user by wallet address or ID
router.get('/user/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

    // Check if identifier is numeric (ID) or string (wallet address)
    const user = isNaN(Number(identifier))
      ? await User.findOne({ where: { walletAddress: identifier } })
      : await User.findByPk(Number(identifier));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return public profile only
    res.json({
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      bio: user.bio,
      reputationScore: user.reputationScore,
      profileImage: user.profileImage,
      githubUsername: user.githubUsername
    });
  } catch (error) {
    console.error('Get user by identifier error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Temporary route to inspect all users in the DB
router.get('/all', async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'walletAddress', 'username', 'email', 'bio', 'createdAt']
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;