//* asset controller
import type { Request, Response } from 'express';
import { Asset } from '#models/asset.model.js';
import { AppError } from '#errors/AppError.js';
import {
  CreateAssetSchema,
  // UpdateAssetSchema,
  CreateAssetInput,
  UpdateAssetFieldsInput,
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

// get all assets
export const allAssetsController = async (req: Request, res: Response) => {
  // quer
  const { status } = req.query;
  // type safe filter object
  const filter: Record<string, unknown> = {};

  // if query exist and is plain string before adding to the query
  if (status && typeof status === 'string') {
    filter.status = status;
  }

  const allAssets = await Asset.find(filter).populate('assignedTo', ['name', 'email']);

  res.status(200).json({
    success: true,
    data: allAssets,
  });
};

// params type
interface AssetParams {
  id: string;
}

// update asset fields
export const updateAssetFieldsController = async (
  req: Request<AssetParams, unknown, UpdateAssetFieldsInput>,
  res: Response
) => {
  // grab id
  const assetId = req.params.id;

  // find - exist
  const assetExists = await Asset.findOne({ _id: assetId });

  if (!assetExists) {
    throw new AppError('This named asset dont exist', 404);
  }

  // changes
  Object.assign(assetExists, req.body);

  // save
  await assetExists.save();

  res.status(200).json({
    success: true,
    data: assetExists,
  });
};
