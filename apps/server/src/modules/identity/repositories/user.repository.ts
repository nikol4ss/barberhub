import { PrismaClient } from "apps/server/generated/prisma/client";

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Busca usuário único pelo índice composto tenantId + email.
  async findByEmailAndTenant(email: string, tenantId: string) {
    return this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });
  }

  // Busca usuário pela chave primária (id).
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // Atualiza o hash e a data de expiração do refresh token do usuário.
  async updateRefreshToken(
    userId: string,
    data: { hash: string; expiresAt: Date },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: data.hash,
        refreshTokenExpiresAt: data.expiresAt,
      },
    });
  }

  // Remove o refresh token persistido do usuário (logout).
  async clearRefreshToken(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null, refreshTokenExpiresAt: null },
    });
  }

  // Atualiza o timestamp do último login do usuário.
  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  // Cria um novo usuário no tenant informado.
  async create(data: {
    tenantId: string;
    name: string;
    email: string;
    passwordHash: string;
    role: "ADMIN" | "MANAGER" | "BARBER" | "ATTENDANT";
  }) {
    return this.prisma.user.create({ data });
  }
}
