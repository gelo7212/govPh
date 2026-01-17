import mongoose, { Schema, Document } from 'mongoose';
import { File, StorageProvider, Visibility, OwnerType } from '../../types';

export interface FileDocument extends Omit<File, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const FileSchema = new Schema<FileDocument>(
  {
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    checksum: { type: String, required: true },
    
    storageProvider: { 
      type: String as any,
      enum: ['LOCAL', 'S3', 'MINIO'] as StorageProvider[],
      default: 'LOCAL',
      required: true,
    },
    storagePath: { type: String, required: true },
    
    visibility: {
      type: String as any,
      enum: ['PRIVATE', 'INTERNAL', 'PUBLIC'] as Visibility[],
      default: 'PRIVATE',
      required: true,
    },
    
    metadata: {
      ownerType: {
        type: String as any,
        enum: ['INCIDENT', 'USER', 'DEPARTMENT', 'CITY', 'FOI', 'FORM'] as OwnerType[],
        required: true,
      },
      ownerId: { type: String, required: true },
    },
    
    uploadedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: false },
    deletedAt: { type: Date, required: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

// Add virtual field to map _id to id for API responses
FileSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Ensure virtuals are included in JSON output
FileSchema.set('toJSON', { virtuals: true });
FileSchema.set('toObject', { virtuals: true });

// Index for faster lookups
FileSchema.index({ 'metadata.ownerId': 1, 'metadata.ownerType': 1 });
FileSchema.index({ uploadedBy: 1 });
FileSchema.index({ deletedAt: 1 });
FileSchema.index({ expiresAt: 1 });
FileSchema.index({ createdAt: -1 });
FileSchema.index({ checksum: 1 });

export const FileModel = mongoose.model<FileDocument>('File', FileSchema);
