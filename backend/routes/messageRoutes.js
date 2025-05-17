
// routes/messageRoutes.js
import express from 'express';
import { getMessagesByThread, sendMessage } from '../controllers/messageController.js';

const router = express.Router();

router.get('/:threadId', getMessagesByThread);
router.post('/', sendMessage);

export default router;