//* asset requests action base business logic controllers (fulfill, reject, recover)

import { Asset } from '#models/asset.model.js';
import { AssetReq } from '#models/assetReq.model.js';
import { AppError } from '#errors/AppError.js';
// import { getLogger } from 'pino-correlation-id';
// import { baseLogger } from '#utils/logger.js';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { createAuditLog } from '#utils/auditLog.js';

// reject asset request
export const rejectAssetReqController = async (req: Request, res: Response) => {
  // params
  const assetReqId = req.params.id;

  //TODO status guard - check requests only be 'PENDING'
  const assetReq = await AssetReq.findById(assetReqId);

  if (!assetReq) {
    throw new AppError('The request is not exists', 404);
  }

  if (assetReq?.status !== 'PENDING') {
    throw new AppError('The request is already handled by ADMIN', 400);
  }

  // change
  assetReq.status = 'REJECTED';
  await assetReq.save();

  // Audit log
  await createAuditLog({
    action: 'REQUEST_REJECTED',
    performedBy: req.user!._id,
    targetId: assetReq._id,
    targetModel: 'AssetReq',
    details: `Asset Request ${assetReq.requestedItem} is rejected`,
  });

  res.status(200).json({
    success: true,
    message: `The Request:${assetReq.requestedItem} by ${assetReq.requesterId} is rejected by IT_ADMIN`,
  });
};

// fullfill request (POST)
export const fullfillAssetReqController = async (req: Request, res: Response) => {
  // check params
  const assetReqId = req.params.id;

  //TODO status guard - check requests only be 'PENDING'
  const assetReq = await AssetReq.findById(assetReqId).populate('requesterId', ['name', 'email']);

  if (!assetReq) {
    throw new AppError('The request is not exists', 404);
  }

  if (assetReq?.status !== 'PENDING') {
    throw new AppError('The request is already handled by ADMIN', 400);
  }

  // check asset is available
  const assetId = req?.body?.assetId;
  // in this api request. body contain only assetId

  if (!assetId) {
    throw new AppError('The asset id is not found in asset request', 400);
  }

  // fetch asset
  const asset = await Asset.findById(assetId);

  // check
  if (!asset) {
    throw new AppError('The asset with provided ID dont exists', 404);
  }

  // check asset status
  if (asset.status !== 'AVAILABLE') {
    throw new AppError(
      `The requested asset: ${asset.name} is not available, already assigned to employee: ${asset.assignedTo}`,
      400
    );
  }

  // values
  const requesterId = assetReq.requesterId;

  // update asset
  asset.assignedTo = requesterId;
  asset.status = 'ASSIGNED';
  await asset.save();

  // update asset request
  assetReq.status = 'APPROVED';
  await assetReq.save();

  // populated user
  interface PopulatedUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
  }

  const requester = assetReq.requesterId as unknown as PopulatedUser;

  // Audit log
  await createAuditLog({
    action: 'REQUEST_APPROVED',
    performedBy: req.user!._id,
    targetId: assetReq._id,
    targetModel: 'AssetReq',
    details: `Asset request: ${assetReq._id} is approved by Admin, Asset: ${asset._id} assigned to Empoyee`,
  });

  // res
  res.status(200).json({
    success: true,
    message: `The asset request for Asset: ${asset.name} is approved, and assigned to Employee:${requester.email}`,
  });
};

// recover asset
export const recoverAssetController = async (req: Request, res: Response) => {
  // values
  const assetId = req.params.assetId; // in params we get assetId

  // check
  const assetExist = await Asset.findById(assetId);

  if (!assetExist) {
    throw new AppError('The asset to recover is not exist', 404);
  }

  // its status
  if (assetExist.status !== 'ASSIGNED' || assetExist.assignedTo === null) {
    throw new AppError('The asset cannot get recover it is available or in maintaince', 400);
  }

  // change
  assetExist.assignedTo = null;
  assetExist.status = 'AVAILABLE';
  await assetExist.save();

  // Audit log
  await createAuditLog({
    action: 'ASSET_RECOVERED',
    performedBy: req.user!._id,
    targetId: assetExist._id,
    targetModel: 'Asset',
    details: `Asset: ${assetExist._id} is recover by Admin`,
  });

  // res
  res.status(200).json({
    success: true,
    message: `The asset: ${assetExist.name} and serial number ${assetExist.serialNumber} is successfully recovered`,
  });
};
