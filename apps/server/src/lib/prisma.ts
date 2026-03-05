import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "apps/server/generated/prisma/client";

const database = process.env.DATABASE_URL;

if (!database) {
  throw new Error("DATABASE_URL is not found.");
}

const adapter = new PrismaPg({ database });
const prisma = new PrismaClient({ adapter });

export { prisma };
