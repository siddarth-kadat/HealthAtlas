import express from 'express';
import { 
    getSummary, 
    getTrends, 
    getGenderStats, 
    getRankings, 
    getMapData, 
    getPredictions,
    getScorecard,
    getSyncStatus 
} from '../controllers/dashboardController.js';
import { cacheDashboardResponse } from '../utils/dashboardCache.js';

const router = express.Router();

router.get('/summary', cacheDashboardResponse('summary'), getSummary);
router.get('/trends', cacheDashboardResponse('trends'), getTrends);
router.get('/gender', cacheDashboardResponse('gender'), getGenderStats);
router.get('/rankings', cacheDashboardResponse('rankings'), getRankings);
router.get('/map-data', cacheDashboardResponse('map-data'), getMapData);
router.get('/predictions', cacheDashboardResponse('predictions'), getPredictions);
router.get('/scorecard', cacheDashboardResponse('scorecard'), getScorecard);
router.get('/sync-status', getSyncStatus);

export default router;
