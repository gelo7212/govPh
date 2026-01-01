import * as mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    firebaseUid: { type: String, required: true, unique: true, index: true },
    role: {
      type: String,
      enum: ['app_admin', 'city_admin', 'sos_admin','sk_youth_admin', 'citizen'],
      required: true,
      caseSensitive: true,
      index: true,
    },
    email: { type: String, sparse: true, unique: true },
    phone: { type: String, sparse: true },
    displayName: { type: String },
    municipalityCode: {
      type: String,
      sparse: true,
      index: true,
    },
    department: {
      type: String,
      enum: ['MDRRMO', 'PNP', 'BFP', 'LGU'],
      sparse: true,
    },
    registrationStatus: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'archived'],
      default: 'pending',
      index: true,
    },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'users',
    timestamps: false, // We manage timestamps manually
  }
);

// Compound indexes for common queries
UserSchema.index({ role: 1, municipalityCode: 1 });
UserSchema.index({ registrationStatus: 1, municipalityCode: 1 });

export default UserSchema;
