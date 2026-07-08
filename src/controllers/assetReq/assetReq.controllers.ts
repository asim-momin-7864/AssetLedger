//* asset request controller
import type { Request, Response } from 'express';
import { AssetReq } from '#models/assetReq.model.js';
import { AppError } from '#errors/AppError.js';
import { CreateAssetReqSchema, CreateAssetReqInput } from '#dtos/assetReq.dto.js';
import { getLogger } from 'pino-correlation-id';
import { baseLogger } from '#utils/logger.js';

// create asset req controller -- EMPLOYEE
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

// all asset requests -- IT ADMIN

// types assertion for query
// status values
type AssetReqStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// type guarde
const isValideStatus = (status: unknown): status is AssetReqStatus => {
  return typeof status === 'string' && ['PENDING', 'APPROVED', 'REJECTED'].includes(status);
};

export const allAssetReqsAdminController = async (req: Request, res: Response) => {
  // query
  const { status } = req.query;

  // filter object
  const filter: { status?: AssetReqStatus } = {};

  // check
  if (isValideStatus(status)) {
    filter.status = status;
  }

  const allRequests = await AssetReq.find(filter);

  // res
  res.status(200).json({
    success: true,
    data: allRequests,
  });
};

// my requests -- EMPLOYEE
export const myAssetRequestsController = async (req: Request, res: Response) => {
  const requesterId = req.user?._id;

  // check user
  if (!requesterId) {
    throw new AppError('UnAuthorized or User not exists', 401);
  }

  const myRequests = await AssetReq.find({ requesterId: requesterId });

  // res
  res.status(200).json({
    success: true,
    data: myRequests,
  });
};
