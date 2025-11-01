import Job from '../models/Job';
import { JobStatus } from '../models/Job';
import { Op, WhereOptions } from 'sequelize';

export class AutoReleaseService {
  // Time limits (in milliseconds)
  private static readonly REVIEW_PERIOD = 72 * 60 * 60 * 1000; // 72 hours
  private static readonly GRACE_PERIOD = 24 * 60 * 60 * 1000; // 24 hours (total 96h)

  // Check for jobs that need auto-release
  static async checkAutoRelease(): Promise<void> {
    try {
      const now = new Date();
      const autoReleaseDeadline = new Date(now.getTime() - (this.REVIEW_PERIOD + this.GRACE_PERIOD));

      // Find submitted jobs past the 96-hour deadline
      const jobsToRelease = await Job.findAll({
        where: {
          status: JobStatus.SUBMITTED,
          submittedAt: {
            [Op.lte]: autoReleaseDeadline
          }
        } as WhereOptions<any>
      });

      if (jobsToRelease.length === 0) {
        console.log('🔍 No jobs require auto-release');
        return;
      }

      console.log(`⚡ Found ${jobsToRelease.length} jobs requiring auto-release`);

      for (const job of jobsToRelease) {
        try {
          await this.processAutoRelease(job);
        } catch (error) {
          console.error(`Failed to auto-release job ${job.jobId}:`, error);
        }
      }

      console.log('✅ Auto-release check completed');
    } catch (error) {
      console.error('Auto-release check error:', error);
    }
  }

  // Process individual job auto-release
  private static async processAutoRelease(job: Job): Promise<void> {
    try {
      // Perform basic AI verification
      const passedVerification = await this.performBasicVerification(job);

      if (passedVerification) {
        // Auto-release payment
        await job.update({
          status: JobStatus.AUTO_RELEASED,
          reviewedAt: new Date()
        });

        console.log(`✅ Auto-released job ${job.jobId}`);

        // TODO: Trigger blockchain payment release
        // TODO: Update reputation scores
        // TODO: Send notifications to both parties
      } else {
        // Hold payment for manual review
        await job.update({
          status: JobStatus.DISPUTED
        });

        console.log(`⚠️ Job ${job.jobId} held for manual review`);

        // TODO: Notify admin/moderators
      }
    } catch (error) {
      console.error(`Auto-release processing error for job ${job.jobId}:`, error);
      throw error;
    }
  }

  // Basic AI verification (placeholder)
  private static async performBasicVerification(job: Job): Promise<boolean> {
    // Check 1: Work was actually submitted
    if (!job.submissionUrl) {
      console.log(`❌ Job ${job.jobId} failed verification: No submission URL`);
      return false;
    }

    // Check 2: Submission URL is valid format
    try {
      new URL(job.submissionUrl);
    } catch {
      console.log(`❌ Job ${job.jobId} failed verification: Invalid URL`);
      return false;
    }

    // Check 3: Job wasn't created too recently (anti-fraud)
    const jobAge = Date.now() - job.createdAt.getTime();
    const minJobAge = 24 * 60 * 60 * 1000; // 24 hours
    if (jobAge < minJobAge) {
      console.log(`❌ Job ${job.jobId} failed verification: Created too recently`);
      return false;
    }

    // TODO: More sophisticated checks
    // - Check if submission matches requirements format
    // - Verify submission file/link is accessible
    // - Check for suspicious patterns

    return true;
  }

  // Check for jobs approaching deadline (send warnings)
  static async sendReviewWarnings(): Promise<void> {
    try {
      const now = new Date();
      
      // Find all submitted jobs without review - use simpler query
      const jobsNeedingWarning = await Job.findAll({
        where: {
          status: JobStatus.SUBMITTED,
          submittedAt: {
            [Op.ne]: null
          }
        } as WhereOptions<any>
      });

      // Filter and warn based on elapsed time
      for (const job of jobsNeedingWarning) {
        // Skip if already reviewed or no submission date
        if (job.reviewedAt || !job.submittedAt) continue;
        
        const hoursElapsed = (now.getTime() - job.submittedAt.getTime()) / (60 * 60 * 1000);
        
        // Send warnings at 24h, 48h, and 60h marks (with 1-hour window)
        if (
          (hoursElapsed >= 24 && hoursElapsed < 25) ||
          (hoursElapsed >= 48 && hoursElapsed < 49) ||
          (hoursElapsed >= 60 && hoursElapsed < 61)
        ) {
          console.log(`⏰ Sending review warning for job ${job.jobId} (${Math.floor(hoursElapsed)}h elapsed)`);
          
          // TODO: Send email/notification to client
        }
      }

    } catch (error) {
      console.error('Warning check error:', error);
    }
  }

  // Start auto-release scheduler (run every hour)
  static startScheduler(): NodeJS.Timeout {
    console.log('🕐 Auto-release scheduler started');

    // Run immediately on start
    this.checkAutoRelease();
    this.sendReviewWarnings();

    // Then run every hour
    return setInterval(async () => {
      await this.checkAutoRelease();
      await this.sendReviewWarnings();
    }, 60 * 60 * 1000); // 1 hour
  }
}