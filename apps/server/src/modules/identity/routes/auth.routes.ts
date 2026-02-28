import { container } from "apps/server/src/shared/container";
import { authHook } from "apps/server/src/shared/hooks/auth.hook";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function authRoutes(app: FastifyInstance) {
  const { authService } = container.cradle;

  app.post("/login", async (request, reply) => {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
      })
      .parse(request.body);

    const result = await authService.login(
      body.email,
      body.password,
      request.tenantId,
    );

    reply.setCookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 60 * 60 * 24 * 7,
    });

    return reply.send({
      accessToken: result.accessToken,
      user: result.user,
      activeModules: result.activeModules,
    });
  });

  app.post("/refresh", async (request, reply) => {
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) {
      return reply.status(401).send({ error: "Refresh token ausente" });
    }

    const payload = app.jwt.decode<{ userId: string }>(refreshToken);
    if (!payload?.userId) {
      return reply.status(401).send({ error: "Token malformado" });
    }

    const result = await authService.refreshToken(payload.userId, refreshToken);

    reply.setCookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 60 * 60 * 24 * 7,
    });

    return reply.send({ accessToken: result.accessToken });
  });

  app.post("/logout", { preHandler: authHook }, async (request, reply) => {
    await authService.logout(request.user.userId);

    reply.clearCookie("refreshToken", { path: "/auth/refresh" });

    return reply.send({ ok: true });
  });
}
