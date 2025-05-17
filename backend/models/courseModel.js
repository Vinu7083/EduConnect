import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual field for materials
courseSchema.virtual('materials', {
  ref: 'Material',
  localField: '_id',
  foreignField: 'courseId',
});

// Virtual field for threads
courseSchema.virtual('threads', {
  ref: 'Thread',
  localField: '_id',
  foreignField: 'courseId',
});

// Apply virtuals when converting to JSON
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

const Course = mongoose.model('Course', courseSchema);

export default Course;