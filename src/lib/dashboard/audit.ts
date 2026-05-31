import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function logAudit(actorId: string, action: string, targetType: string, targetId: string, details?: Prisma.InputJsonValue) {
  return prisma.auditLog.create({ data: { actorId, action, targetType, targetId, details: details ?? {} } });
}