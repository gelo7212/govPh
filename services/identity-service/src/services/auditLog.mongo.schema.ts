import * as mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    actorUserId: { type: String, required: true, index: true },
    actorRole: {
      type: String,
      enum: ['app_admin', 'city_admin', 'sos_admin', 'citizen'],
      required: true,
    },
    action: {
      type: String,
      enum: [
        'create_city_admin',
        'create_sos_admin',
        'suspend_user',
        'activate_user',
        'archive_user',
        'create_rescuer_mission',
        'revoke_rescuer_mission',
        'view_users',
        'view_audit_logs',
      ],
      required: true,
      index: true,
    },
    municipalityCode: { type: String, sparse: true, index: true },
    targetUserId: { type: String, sparse: true, index: true },
    targetRole: {
      type: String,
      enum: ['app_admin', 'city_admin', 'sos_admin', 'citizen'],
      sparse: true,
    },
    metadata: { type: mongoose.Schema.Types.Mixed, sparse: true },
  },
  {
    collection: 'audit_logs',
    timestamps: false,
  }
);

// Compound indexes for audit queries
AuditLogSchema.index({ timestamp: -1, municipalityCode: 1 });
AuditLogSchema.index({ actorUserId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

// TTL index to keep audit logs for 2 years then auto-delete
AuditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 63072000 } // 2 years
);

export default AuditLogSchema;
