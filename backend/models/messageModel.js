import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    trim: true,
  },
  fileUrl: {
    type: String,
  },
  fileType: {
    type: String,
  },
  role: {
    type: String,
    enum: ['student', 'professor', 'ai'],
    required: true,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  approved: {
    type: Boolean,
    default: function() {
      // AI messages require approval, others are auto-approved
      return this.role !== 'ai';
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient queries
messageSchema.index({ threadId: 1, createdAt: 1 });
messageSchema.index({ role: 1, approved: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;