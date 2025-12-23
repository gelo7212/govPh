import * as mongoose from 'mongoose';

const RescuerMissionSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    sosId: { type: String, required: true, index: true },
    municipalityCode: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    permissions: [
      {
        type: String,
        enum: ['view_sos', 'update_status', 'send_location', 'send_message'],
      },
    ],
    createdByUserId: { type: String, required: true, index: true },
    createdByRole: {
      type: String,
      enum: ['app_admin', 'city_admin', 'sos_admin'],
      required: true,
    },
    createdAt: { type: Date, default: Date.now, index: true },
    revokedAt: { type: Date, sparse: true, index: true },
  },
  {
    collection: 'rescuer_missions',
    timestamps: false,
  }
);

// TTL index to auto-delete expired missions after 7 days
RescuerMissionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 604800 } // 7 days
);

export default RescuerMissionSchema;
