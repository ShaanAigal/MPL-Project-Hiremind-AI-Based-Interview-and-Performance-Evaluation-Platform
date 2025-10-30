import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateName: { type: String, required: true },
  candidateEmail: { type: String, required: true },
  resumeData: { type: String, required: true }, 
  resumeFileName: { type: String, required: true }, 
  resumeFileType: { type: String, required: true }, 
  resumeText: { type: String, required: false },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Approved', 'Rejected', 'Interviewing', 'Completed-Interview', 'Selected'],
    default: 'Pending'
  },
  atsScore: { type: Number, required: false },
  score: { type: Number, required: false }, // Overall score from atsAnalysis
  interviewScore: { type: Number, required: false },
  interviewStartDate: { type: Date, required: false },
  atsAnalysis: {
    type: Object,
    required: false,
  },
}, {
  timestamps: true,
});

// Indexes for performance
ApplicationSchema.index({ candidateEmail: 1, createdAt: -1 });
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ jobId: 1, atsScore: -1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ createdAt: -1 });
// Unique compound index to prevent duplicate applications per job by same candidate
ApplicationSchema.index({ jobId: 1, candidateEmail: 1 }, { unique: true, partialFilterExpression: { candidateEmail: { $exists: true } } });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);