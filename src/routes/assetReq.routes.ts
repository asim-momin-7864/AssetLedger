//* asset request routes
import { Router } from 'express';
import { createAssetReqController } from '#controllers/assetReq/assetReq.controllers.js';
import { protectRoute } from '#middlewares/protectRoute.middleware.js';
// import { authorizeRoles } from '#middlewares/authorizeRoles.middleware.js';

// insatnce
const router = Router();

router.post('/', protectRoute, createAssetReqController);

export default router;
