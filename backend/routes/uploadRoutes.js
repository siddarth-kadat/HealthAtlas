import express from 'express';
import multer from 'multer';
import { MAX_DATASET_UPLOAD_SIZE_BYTES, uploadCSV, upload } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

const uploadDataset = (req, res, next) => {
  upload.single('dataset')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        msg: `Dataset file is too large. Maximum allowed size is ${MAX_DATASET_UPLOAD_SIZE_BYTES / 1024 / 1024}MB`,
      });
    }

    return res.status(400).json({ msg: err.message || 'Dataset upload failed' });
  });
};

router.post('/csv', authMiddleware, adminMiddleware, uploadDataset, uploadCSV);
router.post('/csv/append', authMiddleware, uploadDataset, uploadCSV);

export default router;
