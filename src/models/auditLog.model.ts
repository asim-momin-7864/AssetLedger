//* Audit log model
import mongoose, { Types, Document, Schema } from 'mongoose';
import { User } from './user.model.js';

// interface
export interface IAuditLog extends Document {
  action: 'ASSET_CREATED' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | 'ASSET_RECOVERED';
  performedBy: Types.ObjectId | string;
  targetId: Types.ObjectId | string;
  targetModel: 'Asset' | 'AssetReq';
  details: string;
}

// schema
const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      enum: ['ASSET_CREATED', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'ASSET_RECOVERED'],
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetModel',
    },
    targetModel: {
      type: String,
      required: true,
      enum: ['Asset', 'AssetReq'],
    },
    details: {
      type: String,
    },
  },
  { timestamps: true }
);

// model
export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
