import "@fastify/jwt";
import { FastifyReply, FastifyRequest } from "fastify";

export async function authHook(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
    const { userId, tenantId, role } = request.user;

    if (!userId || !tenantId || !role) {
      return reply
        .status(401)
        .send({ error: "Token inválido: payload incompleto" });
    }
  } catch {
    return reply.status(401).send({ error: "Token inválido ou expirado" });
  }
}
