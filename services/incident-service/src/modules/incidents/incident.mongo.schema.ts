import * as mongoose from 'mongoose';

const IncidentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    type: {
      type: String,
      enum: ['emergency', 'disaster', 'accident', 'crime', 'medical', 'other'],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, sparse: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'in_progress', 'resolved', 'rejected'],
      default: 'open',
      required: true,
      index: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      barangayCode: { type: String, sparse: true },
      cityCode: { type: String, required: true, index: true },
      cityId: { type: String, required: true, index: true },
    },
    reporter: {
      userId: { type: String, sparse: true, index: true },
      role: { type: String, enum: ['citizen', 'guest'], required: true },
    },
    attachments: [{ type: String }],
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'incidents',
    timestamps: false,
  }
);

// Compound indexes for common queries
IncidentSchema.index({ cityCode: 1, createdAt: -1 });
IncidentSchema.index({ status: 1, cityCode: 1 });
IncidentSchema.index({ reporter: 1, createdAt: -1 });
IncidentSchema.index({ type: 1, severity: 1 });

export default IncidentSchema;
