import Message from '../models/messageModel.js';
import Thread from '../models/threadModel.js';

export const getMessagesByThread = async (req, res) => {
  try {
    const messages = await Message.find({ threadId: req.params.threadId })
      .populate('userId', 'name email')
      .sort('createdAt');

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { threadId, content } = req.body;
    const userId = req.user._id;

    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found',
      });
    }

    const message = new Message({
      threadId,
      courseId: thread.courseId,
      userId,
      content,
      role: req.user.role,
    });

    await message.save();

    // Update thread's lastMessageAt and messagesCount
    await Thread.findByIdAndUpdate(threadId, {
      lastMessageAt: new Date(),
      $inc: { messagesCount: 1 },
    });

    // Populate the user information
    await message.populate('userId', 'name email');

    // Emit socket event for real-time update
    req.io?.to(`thread:${threadId}`).emit('newMessage', message);

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};