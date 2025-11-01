import { Response } from 'express';
import { Job, User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { JobStatus } from '../models/Job';
import { v4 as uuidv4 } from 'uuid';

export class JobController {
  // Create a new job
  static async createJob(req: AuthRequest, res: Response) {
    try {
      const { title, description, requirements, budget, deadline } = req.body;
      const clientId = req.user!.id;

      // Validate budget
      if (!budget || budget <= 0) {
        return res.status(400).json({ error: 'Budget must be greater than 0' });
      }

      // Validate deadline
      const deadlineDate = new Date(deadline);
      if (deadlineDate <= new Date()) {
        return res.status(400).json({ error: 'Deadline must be in the future' });
      }

      const jobId = `JOB-${uuidv4().slice(0, 8).toUpperCase()}`;

      const job = await Job.create({
        jobId,
        clientId,
        title,
        description,
        requirements,
        budget,
        deadline: deadlineDate,
        status: JobStatus.OPEN
      });

      res.status(201).json({
        message: 'Job created successfully',
        job: {
          id: job.id,
          jobId: job.jobId,
          title: job.title,
          description: job.description,
          budget: job.budget,
          deadline: job.deadline,
          status: job.status
        }
      });
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({ error: 'Failed to create job' });
    }
  }

  // Get all jobs (with filters)
  static async getAllJobs(req: AuthRequest, res: Response) {
    try {
      const { status, clientId, freelancerId } = req.query;

      const where: any = {};
      if (status) where.status = status;
      if (clientId) where.clientId = clientId;
      if (freelancerId) where.freelancerId = freelancerId;

      const jobs = await Job.findAll({
        where,
        include: [
          { model: User, as: 'client', attributes: ['id', 'username', 'walletAddress', 'reputationScore'] },
          { model: User, as: 'freelancer', attributes: ['id', 'username', 'walletAddress', 'reputationScore'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({ jobs });
    } catch (error) {
      console.error('Get jobs error:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  }

  // Get single job by ID
  static async getJobById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const job = await Job.findByPk(id, {
        include: [
          { model: User, as: 'client', attributes: ['id', 'username', 'walletAddress', 'reputationScore'] },
          { model: User, as: 'freelancer', attributes: ['id', 'username', 'walletAddress', 'reputationScore'] }
        ]
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json({ job });
    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  }

  // Apply to a job
  static async applyToJob(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { proposal } = req.body;
      const freelancerId = req.user!.id;

      const job = await Job.findByPk(id);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      if (job.status !== JobStatus.OPEN) {
        return res.status(400).json({ error: 'Job is not open for applications' });
      }

      if (job.clientId === freelancerId) {
        return res.status(400).json({ error: 'Cannot apply to your own job' });
      }

      // TODO: Store applications in separate table
      // For now, just return success
      res.json({ 
        message: 'Application submitted successfully',
        jobId: job.jobId 
      });
    } catch (error) {
      console.error('Apply to job error:', error);
      res.status(500).json({ error: 'Failed to apply to job' });
    }
  }

  // Assign job to freelancer (client only)
  static async assignJob(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { freelancerId } = req.body;
      const clientId = req.user!.id;

      const job = await Job.findByPk(id);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      if (job.clientId !== clientId) {
        return res.status(403).json({ error: 'Only the job creator can assign freelancers' });
      }

      if (job.status !== JobStatus.OPEN) {
        return res.status(400).json({ error: 'Job is not open' });
      }

      // Verify freelancer exists
      const freelancer = await User.findByPk(freelancerId);
      if (!freelancer) {
        return res.status(404).json({ error: 'Freelancer not found' });
      }

      await job.update({
        freelancerId,
        status: JobStatus.IN_PROGRESS
      });

      res.json({
        message: 'Freelancer assigned successfully',
        job: {
          id: job.id,
          jobId: job.jobId,
          status: job.status,
          freelancerId: job.freelancerId
        }
      });
    } catch (error) {
      console.error('Assign job error:', error);
      res.status(500).json({ error: 'Failed to assign job' });
    }
  }

  // Submit work (freelancer only)
  static async submitWork(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { submissionUrl, notes } = req.body;
      const freelancerId = req.user!.id;

      const job = await Job.findByPk(id);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      if (job.freelancerId !== freelancerId) {
        return res.status(403).json({ error: 'Only the assigned freelancer can submit work' });
      }

      if (job.status !== JobStatus.IN_PROGRESS) {
        return res.status(400).json({ error: 'Job is not in progress' });
      }

      await job.update({
        submissionUrl,
        submittedAt: new Date(),
        status: JobStatus.SUBMITTED
      });

      // TODO: Send notification to client
      // TODO: Start 72-hour auto-release timer

      res.json({
        message: 'Work submitted successfully',
        job: {
          id: job.id,
          jobId: job.jobId,
          status: job.status,
          submittedAt: job.submittedAt
        }
      });
    } catch (error) {
      console.error('Submit work error:', error);
      res.status(500).json({ error: 'Failed to submit work' });
    }
  }

  // Review submission (client only)
  static async reviewSubmission(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { action, rejectionReason, rating } = req.body;
      const clientId = req.user!.id;

      if (!['approve', 'reject', 'request_revision'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }

      const job = await Job.findByPk(id);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      if (job.clientId !== clientId) {
        return res.status(403).json({ error: 'Only the job creator can review submissions' });
      }

      if (job.status !== JobStatus.SUBMITTED) {
        return res.status(400).json({ error: 'Job has not been submitted yet' });
      }

      let newStatus: JobStatus;
      const updateData: any = {
        reviewedAt: new Date()
      };

      switch (action) {
        case 'approve':
          newStatus = JobStatus.COMPLETED;
          // TODO: Trigger payment release on blockchain
          // TODO: Update reputation scores
          break;

        case 'reject':
          if (!rejectionReason) {
            return res.status(400).json({ error: 'Rejection reason required' });
          }
          newStatus = JobStatus.DISPUTED;
          updateData.rejectionReason = rejectionReason;
          // TODO: Initiate dispute resolution
          break;

        case 'request_revision':
          newStatus = JobStatus.IN_PROGRESS;
          updateData.submittedAt = null;
          break;

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      await job.update({
        ...updateData,
        status: newStatus
      });

      res.json({
        message: `Job ${action}d successfully`,
        job: {
          id: job.id,
          jobId: job.jobId,
          status: job.status
        }
      });
    } catch (error) {
      console.error('Review submission error:', error);
      res.status(500).json({ error: 'Failed to review submission' });
    }
  }

  // Cancel job (client only, only if OPEN)
  static async cancelJob(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const clientId = req.user!.id;

      const job = await Job.findByPk(id);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      if (job.clientId !== clientId) {
        return res.status(403).json({ error: 'Only the job creator can cancel the job' });
      }

      if (job.status !== JobStatus.OPEN) {
        return res.status(400).json({ error: 'Can only cancel open jobs' });
      }

      await job.update({ status: JobStatus.CANCELLED });

      // TODO: Release escrow funds back to client

      res.json({
        message: 'Job cancelled successfully',
        jobId: job.jobId
      });
    } catch (error) {
      console.error('Cancel job error:', error);
      res.status(500).json({ error: 'Failed to cancel job' });
    }
  }

  // Get user's jobs (as client or freelancer)
  static async getMyJobs(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { role } = req.query; // 'client' or 'freelancer'

      const where: any = {};
      if (role === 'client') {
        where.clientId = userId;
      } else if (role === 'freelancer') {
        where.freelancerId = userId;
      } else {
        // Return both
        where[Op.or] = [
          { clientId: userId },
          { freelancerId: userId }
        ];
      }

      const jobs = await Job.findAll({
        where,
        include: [
          { model: User, as: 'client', attributes: ['id', 'username', 'walletAddress'] },
          { model: User, as: 'freelancer', attributes: ['id', 'username', 'walletAddress'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({ jobs });
    } catch (error) {
      console.error('Get my jobs error:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  }
}

// Add Op import at top
import { Op } from 'sequelize';