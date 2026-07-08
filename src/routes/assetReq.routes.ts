//* asset request routes
import { Router } from 'express';
import {
  createAssetReqController,
  allAssetReqsAdminController,
  myAssetRequestsController,
} from '#controllers/assetReq/assetReq.controllers.js';
import { protectRoute } from '#middlewares/protectRoute.middleware.js';
import { authorizeRoles } from '#middlewares/authorizeRoles.middleware.js';

// insatnce
const router = Router();

//  create
router.post('/', protectRoute, createAssetReqController);

// all requests
router.get('/', protectRoute, authorizeRoles('IT_ADMIN'), allAssetReqsAdminController);

// my requests
router.get('/my-requests', protectRoute, myAssetRequestsController);

export default router;
