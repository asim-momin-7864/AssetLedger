//* asset routes
import { Router } from 'express';
import { authorizeRoles } from '#middlewares/authorizeRoles.middleware.js';
import { protectRoute } from '#middlewares/protectRoute.middleware.js';
import { createAssetController, allAssetsController } from '#controllers/asset/asset.controller.js';

// instance
const router = Router();

// protetcRoute on all
router.use(protectRoute);

// create
router.post('/', authorizeRoles('IT_ADMIN'), createAssetController);

// all assets
router.get('/', authorizeRoles('IT_ADMIN'), allAssetsController);

export default router;
