import express from 'express';
import { getDynamicAlerts, getRealtimeNews } from '../controllers/alertsController.js';

const router = express.Router();

router.get('/', getDynamicAlerts);
router.get('/news', getRealtimeNews);

export default router;
