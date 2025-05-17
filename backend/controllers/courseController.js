import Course from '../models/courseModel.js';

export const createCourse = async (req, res) => {
  try {
    const { title, code, description } = req.body;
    const professor = req.user._id;

    const course = new Course({
      title,
      code,
      description,
      professor,
    });

    await course.save();

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully',
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message,
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('professor', 'name email')
      .populate('students', 'name email');

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get courses',
      error: error.message,
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('professor', 'name email')
      .populate('students', 'name email')
      .populate('materials')
      .populate('threads');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course',
      error: error.message,
    });
  }
};