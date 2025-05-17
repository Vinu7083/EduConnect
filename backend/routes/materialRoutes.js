
// routes/materialRoutes.js
import express from 'express';
import multer from 'multer';
import { uploadMaterial, getMaterialsByCourse } from '../controllers/materialController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/:courseId', upload.single('file'), uploadMaterial);
router.get('/:courseId', getMaterialsByCourse);

export default router;