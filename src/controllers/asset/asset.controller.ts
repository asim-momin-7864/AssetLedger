//* asset controller
import type { Request, Response } from 'express';
import { Asset } from '#models/asset.model.js';
import { AppError } from '#errors/AppError.js';
import {
  CreateAssetSchema,
  // UpdateAssetSchema,
  CreateAssetInput,
  // UpdateAssetInput,
} from '#dtos/asset.dto.js';
import { getLogger } from 'pino-correlation-id';
import { baseLogger } from '#utils/logger.js';

// create asset
export const createAssetController = async (
  req: Request<unknown, unknown, CreateAssetInput>,
  res: Response
) => {
  // logger
  const logger = getLogger(baseLogger);

  // validated
  const validatedData = CreateAssetSchema.parse(req.body);

  // check already exist
  const assetExists = await Asset.findOne({
    serialNumber: validatedData.serialNumber,
  });

  if (assetExists) {
    throw new AppError(`Asset with Serial Number: ${assetExists.serialNumber} already exists`, 409);
  }

  const newAsset = await Asset.create(validatedData);

  // log
  logger.info(
    { name: newAsset.name, serialNumber: newAsset.serialNumber, type: newAsset.type },
    `New asset is successfully added into inventory`
  );

  // res
  res.status(201).json({
    success: true,
    data: {
      _id: newAsset._id,
      name: newAsset.name,
      serialNumber: newAsset.serialNumber,
      type: newAsset.type,
    },
  });
};
