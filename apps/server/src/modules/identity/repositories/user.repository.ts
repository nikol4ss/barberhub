import { PrismaClient } from "apps/server/generated/prisma/client";

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmailAndTenant(email: string, tenantId: string) {
    return this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

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

  async clearRefreshToken(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null, refreshTokenExpiresAt: null },
    });
  }

  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

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
