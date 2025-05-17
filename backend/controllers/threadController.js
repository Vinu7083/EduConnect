import Thread from '../models/threadModel.js';

export const createThread = async (req, res) => {
  try {
    const { title, courseId } = req.body;
    const createdBy = req.user._id;

    const thread = new Thread({
      title,
      courseId,
      createdBy,
    });

    await thread.save();

    res.status(201).json({
      success: true,
      data: thread,
      message: 'Thread created successfully',
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create thread',
      error: error.message,
    });
  }
};

export const getThreadsByCourse = async (req, res) => {
  try {
    const threads = await Thread.find({ courseId: req.params.courseId })
      .populate('createdBy', 'name email')
      .sort('-lastMessageAt');

    res.status(200).json({
      success: true,
      data: threads,
    });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get threads',
      error: error.message,
    });
  }
};