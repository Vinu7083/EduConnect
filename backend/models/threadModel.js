import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Thread title is required'],
    trim: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  messagesCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient queries
threadSchema.index({ courseId: 1, lastMessageAt: -1 });
threadSchema.index({ createdBy: 1 });

const Thread = mongoose.model('Thread', threadSchema);

export default Thread;