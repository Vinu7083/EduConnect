import { OpenAI } from 'openai';
import mongoose from 'mongoose';
import Message from '../models/messageModel.js';
import Thread from '../models/threadModel.js';
import User from '../models/userModel.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Initialize OpenAI with error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || undefined,
});

// Validate API key before using OpenAI
const validateOpenAIKey = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }
};

// Ask a question to AI
export const askQuestion = async (req, res) => {
  try {
    validateOpenAIKey();
    const { threadId, courseId, userId, question } = req.body;
    
    // Validate inputs
    if (!threadId || !courseId || !userId || !question) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }
    
    // Check if thread exists
    const thread = await Thread.findById(threadId);
    
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found',
      });
    }
    
    // Save the student question
    const studentMessage = new Message({
      threadId,
      courseId,
      userId,
      content: question,
      role: 'student',
      createdAt: new Date(),
    });
    
    await studentMessage.save();
    
    // Update thread's lastMessageAt and messagesCount
    await Thread.findByIdAndUpdate(threadId, {
      lastMessageAt: new Date(),
      $inc: { messagesCount: 1 },
    });
    
    // Generate AI response
    const aiResponse = await generateAIResponse(question, threadId);
    
    // Save AI response
    const aiMessage = new Message({
      threadId,
      courseId,
      userId,  // Using the same userId to link the response to the student
      content: aiResponse,
      role: 'ai',
      replyTo: studentMessage._id,
      approved: false,  // Requires professor approval
      createdAt: new Date(),
    });
    
    await aiMessage.save();
    
    // Get the user info
    const user = await User.findById(userId);
    
    // Send response to client
    res.status(200).json({
      success: true,
      message: 'Question submitted successfully. AI response awaiting professor approval.',
      data: {
        studentMessage: {
          _id: studentMessage._id,
          threadId: studentMessage.threadId,
          courseId: studentMessage.courseId,
          userId: studentMessage.userId,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          content: studentMessage.content,
          role: studentMessage.role,
          createdAt: studentMessage.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('AI question error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process question',
      error: error.message,
    });
  }
};

// Generate AI response using OpenAI
const generateAIResponse = async (question, threadId) => {
  try {
    // Get previous messages from the thread for context
    const previousMessages = await Message.find({ threadId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name role');
    
    // Format previous messages for OpenAI
    const messageHistory = previousMessages
      .map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : msg.role === 'professor' ? 'user' : 'user',
        content: msg.content,
        name: msg.userId?.name || 'Unknown',
      }))
      .reverse();
    
    // Add the system message
    const systemMessage = {
      role: 'system',
      content: 'You are a helpful AI assistant in a learning management system. You provide accurate, concise, and educational responses to student questions. Your answers should be informative and helpful but await professor approval before being shown to students.',
    };
    
    // Add the current question
    const userMessage = {
      role: 'user',
      content: question,
    };
    
    // Combine messages
    const messages = [systemMessage, ...messageHistory, userMessage];
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Sorry, I was unable to generate a response at this time. Please try again later.';
  }
};

// Get pending AI responses
export const getPendingResponses = async (req, res) => {
  try {
    // Get course IDs where the user is a professor
    const userId = req.user._id;
    const courseIds = await getCourseIdsForProfessor(userId);
    
    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No courses found for the professor',
      });
    }
    
    // Find pending AI responses for the professor's courses
    const pendingResponses = await Message.find({
      courseId: { $in: courseIds },
      role: 'ai',
      approved: false,
    })
      .populate({
        path: 'replyTo',
        select: 'content userId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .populate('threadId', 'title')
      .populate('courseId', 'title code');
    
    res.status(200).json({
      success: true,
      data: pendingResponses,
      message: 'Pending AI responses retrieved successfully',
    });
  } catch (error) {
    console.error('Get pending responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending responses',
      error: error.message,
    });
  }
};

// Get count of pending AI responses
export const getPendingResponsesCount = async (req, res) => {
  try {
    // Get course IDs where the user is a professor
    const userId = req.user._id;
    const courseIds = await getCourseIdsForProfessor(userId);
    
    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: { count: 0 },
        message: 'No courses found for the professor',
      });
    }
    
    // Count pending AI responses for the professor's courses
    const count = await Message.countDocuments({
      courseId: { $in: courseIds },
      role: 'ai',
      approved: false,
    });
    
    res.status(200).json({
      success: true,
      data: { count },
      message: 'Pending AI responses count retrieved successfully',
    });
  } catch (error) {
    console.error('Get pending responses count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending responses count',
      error: error.message,
    });
  }
};

// Approve AI response
export const approveResponse = async (req, res) => {
  try {
    const { messageId } = req.body;
    
    // Validate input
    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required',
      });
    }
    
    // Get course IDs where the user is a professor
    const userId = req.user._id;
    const courseIds = await getCourseIdsForProfessor(userId);
    
    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }
    
    // Check if the message is an AI response
    if (message.role !== 'ai') {
      return res.status(400).json({
        success: false,
        message: 'Only AI responses can be approved',
      });
    }
    
    // Check if the message belongs to one of the professor's courses
    if (!courseIds.some(id => id.equals(message.courseId))) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this message',
      });
    }
    
    // Approve the message
    message.approved = true;
    await message.save();
    
    // Emit socket event for real-time update
    req.io?.emit('messageApproved', messageId);
    
    res.status(200).json({
      success: true,
      data: message,
      message: 'AI response approved successfully',
    });
  } catch (error) {
    console.error('Approve response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve response',
      error: error.message,
    });
  }
};

// Helper function to get course IDs where the user is a professor
const getCourseIdsForProfessor = async (userId) => {
  const Course = mongoose.model('Course');
  const courses = await Course.find({ professor: userId });
  return courses.map(course => course._id);
};