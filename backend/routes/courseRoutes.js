
// routes/courseRoutes.js
import express from 'express';
import { createCourse, getCourses, getCourseById } from '../controllers/courseController.js';

const router = express.Router();

router.post('/', createCourse);
router.get('/', getCourses);
router.get('/:id', getCourseById);

export default router;