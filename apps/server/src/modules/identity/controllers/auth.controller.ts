import { FastifyReply, FastifyRequest } from "fastify";
import { loginSchema } from "../schemas/auth.schema";
import { AuthService } from "../services/auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = loginSchema.parse(request.body);

    const result = await this.authService.authenticate(
      email,
      password,
      request.tenantId,
    );

    reply.setCookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return reply.code(200).send({
      accessToken: result.accessToken,
      user: result.user,
      activeModules: result.activeModules,
    });
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      return reply.code(401).send({
        type: "BUSINESS_ERROR",
        code: "REFRESH_TOKEN_MISSING",
        message: "Refresh token ausente",
        advice: "Faça login novamente.",
        statusCode: 401,
      });
    }

    const userId = request.user.userId;
    const result = await this.authService.refreshToken(userId, refreshToken);

    reply.setCookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return reply.code(200).send({
      accessToken: result.accessToken,
    });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.userId;
    await this.authService.revokeSession(userId);

    reply.clearCookie("refreshToken", { path: "/" });

    return reply.code(200).send({
      message: "Logout realizado com sucesso",
    });
  }
}
