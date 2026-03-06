import { Redis } from "ioredis";
import { FastifyReply, FastifyRequest } from "fastify";

import { ModuleKey } from "apps/server/generated/prisma/enums";
import { FeatureFlagRepository } from "../../modules/identity/repositories/feature-flag.repository";

  export function createFeatureFlagHook(deps: {
    featureFlagRepository: FeatureFlagRepository;
    redis: Redis;
  }) {
    return function featureFlagHook(moduleKey: ModuleKey) {
      return async function (
        request: FastifyRequest,
        reply: FastifyReply,
      ): Promise<void> {
        const tenantId = request.tenantId;

        if (!tenantId) {
          return reply.status(400).send({ error: "Contexto de tenant ausente" });
        }

        const cacheKey = `feature:${tenantId}:${moduleKey}`;
        const cached = await deps.redis.get(cacheKey);

        if (cached !== null) {
          if (cached === "0") {
            return reply.status(403).send({
              error: "Módulo não disponível no plano atual",
              module: moduleKey,
            });
          }
          return;
        }

        const flag = await deps.featureFlagRepository.findByTenantAndModule(
          tenantId,
          moduleKey,
        );

        const isEnabled = flag?.isEnabled === true;

        await deps.redis.setex(cacheKey, 60, isEnabled ? "1" : "0");

        if (!isEnabled) {
          return reply.status(403).send({
            error: "Módulo não disponível no plano atual",
            module: moduleKey,
          });
        }
      };
    };
  }
