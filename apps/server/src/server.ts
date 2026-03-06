import "dotenv/config";
console.log("DB:", process.env.DATABASE_URL);

import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import Fastify, { FastifyInstance } from "fastify";

import { container } from "./shared/container";
import { registerErrorHandler } from "./shared/hooks/error.hook";
import { createFeatureFlagHook } from "./shared/hooks/feature-flag.hook";
import { createTenantHook } from "./shared/hooks/tenant.hook";

import { authRoutes } from "./modules/identity/routes/auth.routes";

function buildServer(): FastifyInstance {
  const server = Fastify({ logger: true });

  const { tenantRepository, featureFlagRepository, redis } = container.cradle;

  registerErrorHandler(server);

  // Plugins
  server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string,
  });

  server.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET as string,
  });

  // Hooks
  const tenantHook = createTenantHook({ tenantRepository, redis });
  const featureFlagHook = createFeatureFlagHook({
    featureFlagRepository,
    redis,
  });

  server.addHook("preHandler", tenantHook);

  server.decorate("featureFlagHook", featureFlagHook);

  // Routes
  server.register(authRoutes, { prefix: "/auth" });

  return server;
}

async function start() {
  const server = buildServer();

  try {
    await server.listen({ port: 3000 });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

start();
