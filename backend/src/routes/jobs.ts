import { Router } from 'express';
import { JobController } from '../controllers/jobController';
import { authenticate } from '../middleware/auth';
import { 
  validateJobCreation, 
  validateJobReview,
  validateJobSubmission,
  validateJobApplication 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Job CRUD operations
router.post('/', validateJobCreation, JobController.createJob);
router.get('/', JobController.getAllJobs);
router.get('/my-jobs', JobController.getMyJobs);
router.get('/:id', JobController.getJobById);

// Job workflow
router.post('/:id/apply', validateJobApplication, JobController.applyToJob);
router.put('/:id/assign', JobController.assignJob);
router.post('/:id/submit', validateJobSubmission, JobController.submitWork);
router.put('/:id/review', validateJobReview, JobController.reviewSubmission);
router.delete('/:id/cancel', JobController.cancelJob);

export default router;