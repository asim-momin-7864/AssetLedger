//* asset request controller
import type { Request, Response } from 'express';
import { AssetReq } from '#models/assetReq.model.js';
import { AppError } from '#errors/AppError.js';
import { CreateAssetReqSchema, CreateAssetReqInput } from '#dtos/assetReq.dto.js';
import { getLogger } from 'pino-correlation-id';
import { baseLogger } from '#utils/logger.js';

// create asset req controller - employee
export const createAssetReqController = async (
  req: Request<unknown, unknown, CreateAssetReqInput>,
  res: Response
) => {
  // logger
  const logger = getLogger(baseLogger);

  // validate
  const validatedData = CreateAssetReqSchema.parse(req.body);

  // requester id

  // user exist / valide req
  if (!req.user?._id) {
    throw new AppError('Unauthorized - User context missing', 401);
  }

  const requesterId = req.user._id;

  // lets check same request exists
  const assetReqExists = await AssetReq.findOne({
    requesterId,
    requestedItem: validatedData.requestedItem,
  });

  // exist
  if (assetReqExists) {
    throw new AppError(
      `You already made asset request for asset: ${assetReqExists.requestedItem}`,
      409
    );
  }

  // create
  const newAssetReq = await AssetReq.create({
    requesterId: requesterId,
    requestedItem: req.body.requestedItem,
    status: 'PENDING',
  });

  // log
  logger.info(
    {
      requesterId: newAssetReq.requesterId,
      requestItem: newAssetReq.requestedItem,
    },
    'Your asset request is successfully created'
  );

  // res
  res.status(200).json({
    success: true,
    data: newAssetReq,
  });
};
