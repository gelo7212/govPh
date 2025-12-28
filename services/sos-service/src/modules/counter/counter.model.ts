import { model } from 'mongoose';
import { CounterDocument, CounterSchema } from './counter.mongo.schema';

export const Counter = model<CounterDocument>('Counter', CounterSchema);
