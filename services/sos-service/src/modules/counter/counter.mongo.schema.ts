import { Schema, Document, Types } from 'mongoose';

export interface CounterDocument extends Document {
    _id: Types.ObjectId;
    type: string;
    year: number;
    month: number;
    seq: number;
}

export const CounterSchema = new Schema<CounterDocument>(
    {
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        month: {
            type: Number,
            required: true,
        },
        seq: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { _id: false }
);

// Enforce one counter per type + year
CounterSchema.index({ type: 1, year: 1 , month: 1}, { unique: true });

module.exports = {
    CounterSchema,
};