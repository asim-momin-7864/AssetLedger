//* Get all AuditLog
import type { Request, Response } from 'express';
import { AuditLog } from '#models/auditLog.model.js';

export const getAllAuditLogs = async (_req: Request, res: Response) => {
  const auditLogs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .populate('performedBy', ['name', 'email']);

  // Send response
  res.status(200).json({
    success: true,
    results: auditLogs.length,
    data: auditLogs,
  });
};
