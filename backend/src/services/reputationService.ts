import { User, Job } from '../models';
import { GitHubService, GitHubStats } from './githubService';
import { JobStatus } from '../models/Job';

export interface ReputationFactors {
  githubScore: number;
  jobCompletionScore: number;
  reviewScore: number;
  timelinessScore: number;
  disputeScore: number;
}

export class ReputationService {
  // Base reputation score (0-1000)
  private static readonly MAX_SCORE = 1000;
  private static readonly MIN_SCORE = 0;

  // Weight factors
  private static readonly WEIGHTS = {
    github: 0.3,
    jobCompletion: 0.25,
    reviews: 0.25,
    timeliness: 0.15,
    disputes: 0.05
  };

  // Calculate comprehensive reputation score
  static async calculateReputation(userId: number): Promise<number> {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      const factors: ReputationFactors = {
        githubScore: 0,
        jobCompletionScore: 0,
        reviewScore: 0,
        timelinessScore: 0,
        disputeScore: 0
      };

      // 1. GitHub Score (if connected)
      if (user.githubUsername) {
        factors.githubScore = await this.calculateGitHubScore(user.githubUsername);
      }

      // 2. Job Completion Score
      factors.jobCompletionScore = await this.calculateJobCompletionScore(userId);

      // 3. Review Score (placeholder for now)
      factors.reviewScore = await this.calculateReviewScore(userId);

      // 4. Timeliness Score
      factors.timelinessScore = await this.calculateTimelinessScore(userId);

      // 5. Dispute Score (penalty)
      factors.disputeScore = await this.calculateDisputeScore(userId);

      // Calculate weighted total
      const totalScore = 
        factors.githubScore * this.WEIGHTS.github +
        factors.jobCompletionScore * this.WEIGHTS.jobCompletion +
        factors.reviewScore * this.WEIGHTS.reviews +
        factors.timelinessScore * this.WEIGHTS.timeliness -
        factors.disputeScore * this.WEIGHTS.disputes;

      // Clamp between min and max
      return Math.round(Math.max(this.MIN_SCORE, Math.min(this.MAX_SCORE, totalScore)));

    } catch (error) {
      console.error('Reputation calculation error:', error);
      return 0;
    }
  }

  // Calculate GitHub contribution score (0-1000)
  private static async calculateGitHubScore(username: string): Promise<number> {
    try {
      const stats = await GitHubService.calculateStats(username);

      let score = 0;

      // Account age (max 100 points, 1 point per 10 days, cap at 1000 days)
      score += Math.min(100, (stats.accountAge / 10));

      // Public repos (max 150 points, 5 points per repo, cap at 30 repos)
      score += Math.min(150, stats.totalRepos * 5);

      // Stars received (max 200 points, 2 points per star, cap at 100 stars)
      score += Math.min(200, stats.totalStars * 2);

      // Forks (max 100 points, 5 points per fork, cap at 20 forks)
      score += Math.min(100, stats.totalForks * 5);

      // Language diversity (max 50 points, 10 points per language, cap at 5)
      const languageCount = Object.keys(stats.languages).length;
      score += Math.min(50, languageCount * 10);

      return Math.round(score);
    } catch (error) {
      console.error('GitHub score calculation error:', error);
      return 0;
    }
  }

  // Calculate job completion score
  private static async calculateJobCompletionScore(userId: number): Promise<number> {
    try {
      const completedJobs = await Job.count({
        where: {
          freelancerId: userId,
          status: JobStatus.COMPLETED
        }
      });

      const allJobs = await Job.count({
        where: {
          freelancerId: userId
        }
      });

      if (allJobs === 0) return 0;

      // Base score on completion rate and volume
      const completionRate = completedJobs / allJobs;
      const volumeBonus = Math.min(500, completedJobs * 50); // 50 points per job, max 500

      return Math.round(completionRate * 500 + volumeBonus);
    } catch (error) {
      console.error('Job completion score error:', error);
      return 0;
    }
  }

  // Calculate review score (placeholder)
  private static async calculateReviewScore(userId: number): Promise<number> {
    // TODO: Implement when review system is built
    // For now, return base score
    return 500; // Neutral starting point
  }

  // Calculate timeliness score
  private static async calculateTimelinessScore(userId: number): Promise<number> {
    try {
      const jobs = await Job.findAll({
        where: {
          freelancerId: userId,
          status: JobStatus.COMPLETED
        }
      });

      if (jobs.length === 0) return 0;

      let onTimeCount = 0;

      jobs.forEach(job => {
        if (job.submittedAt && job.submittedAt <= job.deadline) {
          onTimeCount++;
        }
      });

      const onTimeRate = onTimeCount / jobs.length;
      return Math.round(onTimeRate * 1000);
    } catch (error) {
      console.error('Timeliness score error:', error);
      return 0;
    }
  }

  // Calculate dispute penalty
  private static async calculateDisputeScore(userId: number): Promise<number> {
    try {
      const disputedJobs = await Job.count({
        where: {
          freelancerId: userId,
          status: JobStatus.DISPUTED
        }
      });

      // Each dispute = -50 points (up to -500 max penalty)
      return Math.min(500, disputedJobs * 50);
    } catch (error) {
      console.error('Dispute score error:', error);
      return 0;
    }
  }

  // Update user reputation in database
  static async updateUserReputation(userId: number): Promise<number> {
    try {
      const newScore = await this.calculateReputation(userId);
      
      await User.update(
        { reputationScore: newScore },
        { where: { id: userId } }
      );

      console.log(`✅ Updated reputation for user ${userId}: ${newScore}`);
      return newScore;
    } catch (error) {
      console.error('Reputation update error:', error);
      throw error;
    }
  }

  // Batch update all users' reputation (can be run as cron job)
  static async updateAllReputations(): Promise<void> {
    try {
      const users = await User.findAll({
        where: { isActive: true }
      });

      console.log(`🔄 Updating reputation for ${users.length} users...`);

      for (const user of users) {
        try {
          await this.updateUserReputation(user.id);
        } catch (error) {
          console.error(`Failed to update reputation for user ${user.id}:`, error);
        }
      }

      console.log('✅ Batch reputation update completed');
    } catch (error) {
      console.error('Batch reputation update error:', error);
      throw error;
    }
  }
}