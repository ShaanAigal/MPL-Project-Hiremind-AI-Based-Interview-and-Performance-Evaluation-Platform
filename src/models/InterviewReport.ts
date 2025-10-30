import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewReport extends Document {
  applicationId: string;
  userId: string;
  jobRole: string;
  interviewDate: Date;
  conversation: { role: 'user' | 'ai'; text: string }[];
  feedback: {
    overallScore: number;
    overallImpression: string;
    ratings: {
      technicalSkills: number;
      communication: number;
      problemSolving: number;
      cultureFit: number;
    };
    strengths: string[];
    improvements: string[];
  };
  status: 'processing' | 'completed' | 'failed'; // New field
}

const InterviewReportSchema: Schema = new Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: false },
  userId: { type: String, required: true, default: 'default-user' },
  jobRole: { type: String, required: true },
  interviewDate: { type: Date, default: Date.now },
  conversation: [{
    role: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true }
  }],
  feedback: {
    overallScore: { type: Number },
    overallImpression: { type: String },
    ratings: {
      technicalSkills: { type: Number, min: 0, max: 5 },
      communication: { type: Number, min: 0, max: 5 },
      problemSolving: { type: Number, min: 0, max: 5 },
      cultureFit: { type: Number, min: 0, max: 5 },
    },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
  },
  status: { // New field definition
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  },
}, { timestamps: true });

// Indexes for lookups and sorting
InterviewReportSchema.index({ applicationId: 1 });
InterviewReportSchema.index({ userId: 1, interviewDate: -1 });
InterviewReportSchema.index({ interviewDate: -1 });

export default mongoose.models.InterviewReport || mongoose.model<IInterviewReport>('InterviewReport', InterviewReportSchema);