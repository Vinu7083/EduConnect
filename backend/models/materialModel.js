import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Material title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient queries
materialSchema.index({ courseId: 1, uploadedAt: -1 });
materialSchema.index({ uploadedBy: 1 });

const Material = mongoose.model('Material', materialSchema);

export default Material;