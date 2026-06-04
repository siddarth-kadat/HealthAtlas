import express from 'express';
import { handleChat } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route - only authenticated users can chat
router.post('/', authMiddleware, handleChat);

export default router;
