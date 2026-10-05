import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  event: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  challengeId: String,
  metadata: { type: Object, default: {} }
}, { timestamps: true });

export const AuditLog = mongoose.model('AuditLog', auditSchema);
