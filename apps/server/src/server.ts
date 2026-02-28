import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import Fastify from "fastify";

import { authRoutes } from "./modules/identity/routes/auth.routes";
import { container } from "./shared/container";
import { createFeatureFlagHook } from "./shared/hooks/feature-flag.hook";
import { createTenantHook } from "./shared/hooks/tenant.hook";

const server = Fastify({ logger: true });

await server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET!,
});

await server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET!,
});

const { tenantRepository, featureFlagRepository, redis } = container.cradle;

const tenantHook = createTenantHook({ tenantRepository, redis });
server.addHook("preHandler", tenantHook);

const featureFlagHook = createFeatureFlagHook({
  featureFlagRepository,
  redis,
});

server.decorate("featureFlagHook", featureFlagHook);

await server.register(authRoutes, { prefix: "/auth" });

const start = async () => {
  try {
    await server.listen({ port: 3000 });
    console.info("Server on: http://localhost:3000");
  } catch (error: unknown) {
    console.error("Server off: Error");
    server.log.error(error);
    process.exit(1);
  }
};

start();
