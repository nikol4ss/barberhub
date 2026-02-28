import { PrismaClient } from "apps/server/generated/prisma/client";

export class TenantRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }

  async findById(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  async create(data: { slug: string; name: string; ownerEmail: string }) {
    return this.prisma.tenant.create({
      data: { slug: data.slug, name: data.name },
    });
  }
}
