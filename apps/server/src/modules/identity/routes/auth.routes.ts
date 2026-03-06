import { container } from "apps/server/src/shared/container";
import { authHook } from "apps/server/src/shared/hooks/auth.hook";
import { FastifyInstance } from "fastify";

export async function authRoutes(app: FastifyInstance) {
  const { authController } = container.cradle;

  app.post("/login", async (request, reply) => {
    return authController.login(request, reply);
  });

  app.post("/refresh", async (request, reply) => {
    return authController.refresh(request, reply);
  });

  app.post("/logout", { preHandler: authHook }, async (request, reply) => {
    return authController.logout(request, reply);
  });
}
