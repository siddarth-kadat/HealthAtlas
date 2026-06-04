import express from 'express';
import { createStory, updateStory, getStoryBySlug, getAllStories, getUserStories, getUserStoryById, deleteStory } from '../controllers/storyController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createStory);
router.put('/:id', authMiddleware, updateStory);
router.delete('/:id', authMiddleware, deleteStory);
router.get('/user/my-stories', authMiddleware, getUserStories);
router.get('/user/my-stories/:id', authMiddleware, getUserStoryById);
router.get('/public/all', getAllStories);
router.get('/:slug', getStoryBySlug);

export default router;
