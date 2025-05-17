
// routes/threadRoutes.js
import express from 'express';
import { createThread, getThreadsByCourse } from '../controllers/threadController.js';

const router = express.Router();

router.post('/', createThread);
router.get('/:courseId', getThreadsByCourse);

export default router;

