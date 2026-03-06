import { InjectionMode, asClass, asValue, createContainer } from "awilix";
import { Redis } from "ioredis";
import { prisma } from "../lib/prisma";

import { EventBus } from "./events/event-bus";

import { AuthController } from "../modules/identity/controllers/auth.controller";

import { FeatureFlagRepository } from "../modules/identity/repositories/feature-flag.repository";
import { SubscriptionRepository } from "../modules/identity/repositories/subscription.repository";
import { TenantRepository } from "../modules/identity/repositories/tenant.repository";
import { UserRepository } from "../modules/identity/repositories/user.repository";

import { AuthService } from "../modules/identity/services/auth.service";
import { TenantService } from "../modules/identity/services/tenant.service";

const redis = new Redis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
});

export interface AppCradle {
  prisma: typeof prisma;
  redis: Redis;
  eventBus: typeof EventBus;

  tenantRepository: TenantRepository;
  userRepository: UserRepository;
  featureFlagRepository: FeatureFlagRepository;
  subscriptionRepository: SubscriptionRepository;

  authService: AuthService;
  authController: AuthController;
  tenantService: TenantService;
}

export const container = createContainer<AppCradle>({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  prisma: asValue(prisma),
  redis: asValue(redis),
  eventBus: asValue(EventBus),

  tenantRepository: asClass(TenantRepository).singleton(),
  userRepository: asClass(UserRepository).singleton(),
  featureFlagRepository: asClass(FeatureFlagRepository).singleton(),
  subscriptionRepository: asClass(SubscriptionRepository).singleton(),

  authService: asClass(AuthService).singleton(),
  authController: asClass(AuthController).singleton(),
  tenantService: asClass(TenantService).singleton(),
});
