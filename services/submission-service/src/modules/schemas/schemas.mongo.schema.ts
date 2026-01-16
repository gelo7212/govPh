import { Schema, model } from 'mongoose';

/**
 * Form Field Type Definition
 */
export interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  default?: any;
  options?: Array<{ label: string; value: string }>;
  validation?: Record<string, any>;
  ui?: {
    hint?: string;
    width?: 'full' | 'half' | 'third';
  };
  meta?: Record<string, any>;
  visibility?: {
    when: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
}

/**
 * Form Schema Document Type
 */
export interface IFormSchema {
  _id?: string;
  formKey: string;
  version: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  title: string;
  description?: string;
  fields: FormField[];
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  publishedAt?: Date;
}

const formFieldSchema = new Schema({
  id: String,
  type: String,
  label: String,
  required: Boolean,
  placeholder: String,
  default: Schema.Types.Mixed,
  options: [
    {
      label: String,
      value: String,
    },
  ],
  validation: Schema.Types.Mixed,
  ui: {
    hint: String,
    width: String,
  },
  meta: Schema.Types.Mixed,
  visibility: {
    when: [
      {
        field: String,
        operator: String,
        value: Schema.Types.Mixed,
      },
    ],
  },
});

const formSchemaSchema = new Schema<IFormSchema>({
  formKey: {
    type: String,
    required: true,
    unique: true,
  },
  version: {
    type: Number,
    required: true,
    default: 1,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  fields: [formFieldSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: String,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: String,
  publishedAt: Date,
});

// Indexes
formSchemaSchema.index({ formKey: 1 });
formSchemaSchema.index({ status: 1 });
formSchemaSchema.index({ createdAt: -1 });

export const SchemaModel = model<IFormSchema>('schemas', formSchemaSchema);
