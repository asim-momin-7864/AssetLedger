//* Asset request model

import mongoose, { Schema, Document, Types } from 'mongoose';
import { User } from './user.model.js';

// ts type for schema
export interface IAssetReqSchema extends Document {
  requesterId: Types.ObjectId;
  requestedItem: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// schema
const AssetReqSchema = new Schema<IAssetReqSchema>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
      index: true,
    },
    requestedItem: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

// model
export const AssetReq = mongoose.model<IAssetReqSchema>('AssetReq', AssetReqSchema);
