import express from 'express';
import { 
    askQuestion, 
    approveResponse, 
    getPendingResponses 
} from '../controllers/aiController.js';
import { protect, professorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes for AI interactions
router.post('/ask', protect, askQuestion);
router.post('/approve', protect, professorOnly, approveResponse);
router.get('/pending', protect, professorOnly, getPendingResponses);

export default router;