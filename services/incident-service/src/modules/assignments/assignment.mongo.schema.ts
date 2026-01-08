import * as mongoose from 'mongoose';

const IncidentAssignmentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    incidentId: { type: String, required: true, index: true },
    cityCode: { type: String, required: true, index: true },
    departmentCode: { type: String, required: true, index: true },
    departmentName: { type: String, sparse: true },
    assignedBy: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
      required: true,
      index: true,
    },
    responderId: { type: String, sparse: true, index: true },
    notes: { type: String, sparse: true },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'incident_assignments',
    timestamps: false,
  }
);

// Compound indexes for common queries
IncidentAssignmentSchema.index({ incidentId: 1, status: 1 });
IncidentAssignmentSchema.index({ cityCode: 1, departmentCode: 1, status: 1 });
IncidentAssignmentSchema.index({ responderId: 1, status: 1 });

export default IncidentAssignmentSchema;
