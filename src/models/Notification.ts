import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  candidateEmail: { type: String, required: true, index: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false, index: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
}, {
  timestamps: true,
});

// Add compound index for efficient querying by email and creation date
NotificationSchema.index({ candidateEmail: 1, createdAt: -1 });
// Add index for unread notifications
NotificationSchema.index({ isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);