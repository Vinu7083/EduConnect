import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import threadRoutes from './routes/threadRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Import middleware
import { protect } from './middleware/authMiddleware.js';
import { setupSocketAuth } from './middleware/socketMiddleware.js';

// Config
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/courses', protect, courseRoutes);
app.use('/api/threads', protect, threadRoutes);
app.use('/api/messages', protect, messageRoutes);
app.use('/api/materials', protect, materialRoutes);
app.use('/api/ai', protect, aiRoutes);

// Socket.io
setupSocketAuth(io);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join course room
  socket.on('joinCourse', ({ courseId }) => {
    socket.join(`course:${courseId}`);
    console.log(`Socket ${socket.id} joined course:${courseId}`);
  });
  
  // Leave course room
  socket.on('leaveCourse', ({ courseId }) => {
    socket.leave(`course:${courseId}`);
    console.log(`Socket ${socket.id} left course:${courseId}`);
  });
  
  // Join thread room
  socket.on('joinThread', ({ threadId }) => {
    socket.join(`thread:${threadId}`);
    console.log(`Socket ${socket.id} joined thread:${threadId}`);
  });
  
  // Leave thread room
  socket.on('leaveThread', ({ threadId }) => {
    socket.leave(`thread:${threadId}`);
    console.log(`Socket ${socket.id} left thread:${threadId}`);
  });
  
  // Handle new message
  socket.on('sendMessage', async (messageData) => {
    try {
      // Create message in database
      const Message = mongoose.model('Message');
      const User = mongoose.model('User');
      
      const user = await User.findById(messageData.userId);
      
      if (!user) {
        console.error('User not found');
        return;
      }
      
      const newMessage = new Message({
        threadId: messageData.threadId,
        courseId: messageData.courseId,
        userId: messageData.userId,
        content: messageData.content,
        role: messageData.role,
        createdAt: new Date(),
      });
      
      await newMessage.save();
      
      // Update thread's lastMessageAt
      const Thread = mongoose.model('Thread');
      await Thread.findByIdAndUpdate(messageData.threadId, {
        lastMessageAt: new Date(),
        $inc: { messagesCount: 1 },
      });
      
      // Prepare message data with user info for the clients
      const messageToSend = {
        _id: newMessage._id,
        threadId: newMessage.threadId,
        courseId: newMessage.courseId,
        userId: newMessage.userId,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        content: newMessage.content,
        fileUrl: newMessage.fileUrl,
        fileType: newMessage.fileType,
        role: newMessage.role,
        createdAt: newMessage.createdAt,
        replyTo: newMessage.replyTo,
        approved: newMessage.approved,
      };
      
      // Broadcast to room
      io.to(`thread:${messageData.threadId}`).emit('newMessage', messageToSend);
      
      console.log(`New message sent to thread:${messageData.threadId}`);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });
  
  // Handle AI response approval
  socket.on('approveAIMessage', ({ messageId }) => {
    io.emit('messageApproved', messageId);
    console.log(`AI message ${messageId} approved`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;