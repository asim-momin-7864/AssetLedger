//* asset model

import mongoose, { Schema, Document, Types } from 'mongoose';
import { User } from './user.model.js';

// interface for asset schema
export interface IAsset extends Document {
  name: string;
  type: 'HARDWARE' | 'SOFTWARE' | 'ACCESSORY';
  serialNumber: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE';
  assignedTo: Types.ObjectId | null;
  _modifiedBy: Types.ObjectId | null;
}

// schema
const AssetSchema = new Schema<IAsset>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['HARDWARE', 'SOFTWARE', 'ACCESSORY'],
      required: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE'],
      required: true,
      default: 'AVAILABLE',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: User,
      default: null,
    },
    // _modifiedBy: {}
    /*
    Since you only need this field temporarily to pass the "User ID" from the Controller to the Audit Log hook, 
    */
  },
  {
    timestamps: true,
  }
);

// model
export const Asset = mongoose.model<IAsset>('Asset', AssetSchema);
