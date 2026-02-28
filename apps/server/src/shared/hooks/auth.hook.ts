import "@fastify/jwt";
import { FastifyReply, FastifyRequest } from "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {

    payload: {
      userId: string;
      tenantId: string;
      role: "ADMIN" | "MANAGER" | "BARBER" | "ATTENDANT";
    };
    
    user: {
      userId: string;
      tenantId: string;
      role: "ADMIN" | "MANAGER" | "BARBER" | "ATTENDANT";
    };
  }
}

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
