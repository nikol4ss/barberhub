import {
  Plan,
  PrismaClient,
  SubscriptionStatus,
} from "apps/server/generated/prisma/client";

export class SubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: {
    tenantId: string;
    plan: Plan;
    status: SubscriptionStatus;
    trialEndsAt?: Date;
  }) {
    return this.prisma.subscription.create({ data });
  }

  async findByTenant(tenantId: string) {
    return this.prisma.subscription.findUnique({ where: { tenantId } });
  }

  async updatePlan(tenantId: string, plan: Plan) {
    return this.prisma.subscription.update({
      where: { tenantId },
      data: { plan },
    });
  }

  async updateStatus(tenantId: string, status: SubscriptionStatus) {
    return this.prisma.subscription.update({
      where: { tenantId },
      data: { status },
    });
  }
}
