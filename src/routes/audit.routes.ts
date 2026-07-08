import { Router } from 'express';
import { getAllAuditLogs } from '#controllers/auditLog/auditLog.controller.js';
import { protectRoute } from '#middlewares/protectRoute.middleware.js';
import { authorizeRoles } from '#middlewares/authorizeRoles.middleware.js';

const router = Router();

router.get('/', protectRoute, authorizeRoles('IT_ADMIN'), getAllAuditLogs);

export default router;
