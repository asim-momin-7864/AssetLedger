//* asset routes
import { Router } from 'express';
import { authorizeRoles } from '#middlewares/authorizeRoles.middleware.js';
import { protectRoute } from '#middlewares/protectRoute.middleware.js';
import { createAssetController } from '#controllers/asset/asset.controller.js';

// instance
const router = Router();

router.post('/', protectRoute, authorizeRoles('IT_ADMIN'), createAssetController);

export default router;
