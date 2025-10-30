// src/models/Job.ts
import mongoose, { Schema } from 'mongoose';

const JobSchema = new Schema({
  title: { type: String, required: [true, 'Please provide a job title.'] },
  company: { type: String, required: [true, 'Please provide a company name.'] },
  skills: [{ type: String, required: [true, 'Please provide at least one skill.'] }],
  location: { type: String, required: [true, 'Please provide a location.'] },
  salaryRange: { type: String, required: false },
  expiryDate: { type: Date, required: [true, 'Please provide an expiry date.'] },
  description: { type: String, required: [true, 'Please provide a job description.'] },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Draft'],
    default: 'Active',
  },
  applications: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Indexes for common queries
JobSchema.index({ createdAt: -1 });
JobSchema.index({ expiryDate: 1 });
// If recruiter-specific filtering is added, consider adding recruiterId index
// JobSchema.index({ recruiterId: 1 });

export default mongoose.models.Job || mongoose.model('Job', JobSchema);