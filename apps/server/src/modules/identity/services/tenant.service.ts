import { ModuleKey, Plan } from "apps/server/generated/prisma/enums";
import bcrypt from "bcryptjs";
import { Redis } from "ioredis";
import { FeatureFlagRepository } from "../repositories/feature-flag.repository";
import { SubscriptionRepository } from "../repositories/subscription.repository";
import { TenantRepository } from "../repositories/tenant.repository";
import { UserRepository } from "../repositories/user.repository";

  const PLAN_MODULES: Record<Plan, ModuleKey[]> = {
    STARTER: ["MODULO_AGENDAMENTO", "MODULO_CLIENTES", "MODULO_FINANCEIRO"],
    PRO: [
      "MODULO_AGENDAMENTO",
      "MODULO_CLIENTES",
      "MODULO_FINANCEIRO",
      "MODULO_PAGAMENTO_ONLINE",
      "MODULO_EQUIPE",
      "MODULO_DASHBOARD",
      "MODULO_FIDELIDADE",
      "MODULO_COMUNICACAO",
    ],
    BUSINESS: [
      "MODULO_AGENDAMENTO",
      "MODULO_CLIENTES",
      "MODULO_FINANCEIRO",
      "MODULO_PAGAMENTO_ONLINE",
      "MODULO_EQUIPE",
      "MODULO_DASHBOARD",
      "MODULO_FIDELIDADE",
      "MODULO_COMUNICACAO",
      "MODULO_PRODUTOS",
      "MODULO_VENDA_BALCAO",
      "MODULO_LOJA_ONLINE",
      "MODULO_FORNECEDORES",
      "MODULO_MULTI_UNIDADE",
      "MODULO_FISCAL",
    ],
  };

export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly userRepository: UserRepository,
    private readonly featureFlagRepository: FeatureFlagRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly redis: Redis,
  ) {}

  async createTenant(input: {
    slug: string;
    barbershopName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPassword: string;
    plan: Plan;
  }) {
    const slugExists = await this.tenantRepository.findBySlug(input.slug);
    if (slugExists) {
      throw new Error(
        `O endereço "${input.slug}.barberhub.com.br" já está em uso`,
      );
    }

    const tenant = await this.tenantRepository.create({
      slug: input.slug,
      name: input.barbershopName,
      ownerEmail: input.ownerEmail,
    });

    const passwordHash = await bcrypt.hash(input.ownerPassword, 12);
    await this.userRepository.create({
      tenantId: tenant.id,
      name: input.ownerName,
      email: input.ownerEmail,
      passwordHash,
      role: "ADMIN",
    });

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    await this.subscriptionRepository.create({
      tenantId: tenant.id,
      plan: input.plan,
      status: "TRIAL",
      trialEndsAt,
    });

    await this.activateModulesForPlan(tenant.id, input.plan);

    return tenant;
  }

  async changePlan(tenantId: string, newPlan: Plan) {
    await this.subscriptionRepository.updatePlan(tenantId, newPlan);

    const allModules = Object.values(ModuleKey);
    await Promise.all(
      allModules.map((moduleKey) =>
        this.featureFlagRepository.setEnabled(tenantId, moduleKey, false),
      ),
    );

    await this.activateModulesForPlan(tenantId, newPlan);
    await this.invalidateTenantFlagsCache(tenantId);
  }

  async suspendTenant(tenantId: string) {
    await this.subscriptionRepository.updateStatus(tenantId, "SUSPENDED");

    const allModules = Object.values(ModuleKey);
    await Promise.all(
      allModules.map((m) =>
        this.featureFlagRepository.setEnabled(tenantId, m as ModuleKey, false),
      ),
    );

    await this.invalidateTenantFlagsCache(tenantId);
  }

  private async activateModulesForPlan(tenantId: string, plan: Plan) {
    const modules = PLAN_MODULES[plan];
    await Promise.all(
      modules.map((moduleKey) =>
        this.featureFlagRepository.setEnabled(tenantId, moduleKey, true),
      ),
    );
  }

  private async invalidateTenantFlagsCache(tenantId: string) {
    const allModules = Object.values(ModuleKey);
    const keys = allModules.map((m) => `feature:${tenantId}:${m}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
