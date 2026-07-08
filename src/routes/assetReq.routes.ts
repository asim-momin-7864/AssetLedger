//* asset request routes
import { Router } from 'express';
import {
  createAssetReqController,
  allAssetReqsAdminController,
  myAssetRequestsController,
} from '#controllers/assetReq/assetReq.controllers.js';
import {
  rejectAssetReqController,
  fullfillAssetReqController,
  recoverAssetController,
} from '#controllers/assetReq/assetReq.workflow.js';
import { protectRoute } from '#middlewares/protectRoute.middleware.js';
import { authorizeRoles } from '#middlewares/authorizeRoles.middleware.js';

// insatnce
const router = Router();

router.use(protectRoute);

//  create
router.post('/', createAssetReqController);

// all requests
router.get('/', authorizeRoles('IT_ADMIN'), allAssetReqsAdminController);

// my requests
router.get('/my-requests', myAssetRequestsController);

// reejct asset reqeust
router.patch('/:id/reject', authorizeRoles('IT_ADMIN'), rejectAssetReqController);

// fullfill asset request
router.patch('/:id/fullfill', authorizeRoles('IT_ADMIN'), fullfillAssetReqController);

// recover asset
router.patch('/:assetId/recover', authorizeRoles('IT_ADMIN'), recoverAssetController);

export default router;
