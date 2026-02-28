import { PrismaClient } from "apps/server/generated/prisma/client";
import { ModuleKey } from "apps/server/generated/prisma/enums";

  export class FeatureFlagRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findByTenantAndModule(tenantId: string, moduleKey: ModuleKey) {
      return this.prisma.featureFlag.findUnique({
        where: { tenantId_moduleKey: { tenantId, moduleKey } },
      });
    }

    async findAllByTenant(tenantId: string) {
      return this.prisma.featureFlag.findMany({
        where: { tenantId, isEnabled: true },
        select: { moduleKey: true },
      });
    }

    async setEnabled(tenantId: string, moduleKey: ModuleKey, enabled: boolean) {
      return this.prisma.featureFlag.upsert({
        where: { tenantId_moduleKey: { tenantId, moduleKey } },
        create: {
          tenantId,
          moduleKey,
          isEnabled: enabled,
          enabledAt: enabled ? new Date() : null,
          disabledAt: !enabled ? new Date() : null,
        },
        update: {
          isEnabled: enabled,
          enabledAt: enabled ? new Date() : undefined,
          disabledAt: !enabled ? new Date() : undefined,
        },
      });
    }
  }
