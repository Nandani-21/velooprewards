import { AuditLog } from '../models/AuditLog.js';

export function writeAudit(event, data = {}) {
  return AuditLog.create({ event, ...data });
}
