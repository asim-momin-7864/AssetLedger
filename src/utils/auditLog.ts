//* Audit Log hlper fucntion

import type { IAuditLog } from '#models/auditLog.model.js';
import { AuditLog } from '#models/auditLog.model.js';

// type of payload
export type AuditLogInput = Pick<
  IAuditLog,
  'action' | 'performedBy' | 'targetId' | 'targetModel' | 'details'
>;

export const createAuditLog = async (data: AuditLogInput): Promise<void> => {
  await AuditLog.create(data);
};
