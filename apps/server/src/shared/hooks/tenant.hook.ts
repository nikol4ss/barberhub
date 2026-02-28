import { FastifyReply, FastifyRequest } from "fastify";
import { Redis } from "ioredis";
import { TenantRepository } from "../../modules/identity/repositories/tenant.repository";

declare module "fastify" {
  interface FastifyRequest {
    tenantId: string;
    tenantSlug: string;
  }
}

export function createTenantHook(deps: {
  tenantRepository: TenantRepository;
  redis: Redis;
}) {
  return async function tenantHook(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const host = request.hostname;
    const slug = host.split(".")[0];

    if (!slug || slug === "www" || slug === "app") {
      return;
    }

    const cacheKey = `tenant:slug:${slug}`;
    const cached = await deps.redis.get(cacheKey);

    if (cached) {
      request.tenantId = cached;
      request.tenantSlug = slug;
      return;
    }

    const tenant = await deps.tenantRepository.findBySlug(slug);

    if (!tenant) {
      return reply.status(404).send({ error: "Barbearia não encontrada" });
    }

    await deps.redis.setex(cacheKey, 300, tenant.id);

    request.tenantId = tenant.id;
    request.tenantSlug = slug;
  };
}
