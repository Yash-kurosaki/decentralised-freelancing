import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

// Generic request validator
export const validateRequest =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));

        return res.status(400).json({
          message: 'Validation failed',
          details,
        });
      }

      return res.status(500).json({
        message: 'Internal server error during validation',
        error: (err as Error).message,
      });
    }
  };

// ----------------------
// Wallet + Auth validators
// ----------------------

const walletAddressSchema = z.object({
  walletAddress: z
    .string()
    .min(32, 'Invalid wallet address length')
    .max(64, 'Invalid wallet address length'),
});

const signatureSchema = z.object({
  walletAddress: z
    .string()
    .min(32, 'Invalid wallet address length')
    .max(64, 'Invalid wallet address length'),
  signature: z.string().min(8, 'Signature is required'),
  message: z.string().min(6, 'Message is required'),
});

const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .optional(),
});

export const validateWalletAddress = validateRequest(walletAddressSchema);
export const validateSignature = validateRequest(signatureSchema);
export const validateProfileUpdate = validateRequest(profileUpdateSchema);

// ----------------------
// Job-related validators
// ----------------------

const jobCreationSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  requirements: z.string().optional(),
  budget: z
    .number()
    .positive('Budget must be greater than 0')
    .min(0.001, 'Budget must be at least 0.001 SOL'),
  deadline: z
    .string()
    .datetime('Invalid datetime format')
    .refine(
      (val) => {
        const d = new Date(val);
        return !isNaN(d.getTime()) && d.getTime() > Date.now();
      },
      { message: 'Deadline must be a valid future date' }
    ),
});

const jobReviewSchema = z
  .object({
    action: z.enum(['approve', 'reject', 'request_revision']),
    rejectionReason: z.string().optional(),
    rating: z.number().int().min(1).max(5).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.action === 'reject' && !data.rejectionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Rejection reason required when rejecting a job',
        path: ['rejectionReason'],
      });
    }
  });

const jobSubmissionSchema = z.object({
  submissionUrl: z
    .string()
    .url('Invalid URL format')
    .min(10, 'Submission URL is required'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

const jobApplicationSchema = z.object({
  proposal: z
    .string()
    .min(50, 'Proposal must be at least 50 characters')
    .max(2000, 'Proposal must be less than 2000 characters'),
});

export const validateJobCreation = validateRequest(jobCreationSchema);
export const validateJobReview = validateRequest(jobReviewSchema);
export const validateJobSubmission = validateRequest(jobSubmissionSchema);
export const validateJobApplication = validateRequest(jobApplicationSchema);

// ----------------------
// GitHub validators
// ----------------------

const githubConnectSchema = z.object({
  githubUsername: z
    .string()
    .min(1, 'GitHub username is required')
    .max(39, 'GitHub username must be less than 39 characters')
    .regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, 'Invalid GitHub username format'),
});

export const validateGitHubConnect = validateRequest(githubConnectSchema);