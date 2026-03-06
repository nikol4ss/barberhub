import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { AuthErrors } from "../errors/auth.error";

import { FeatureFlagRepository } from "../repositories/feature-flag.repository";
import { UserRepository } from "../repositories/user.repository";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly featureFlagRepository: FeatureFlagRepository,
  ) {}

  async authenticate(email: string, password: string, tenantId: string) {
    const user = await this.userRepository.findByEmailAndTenant(
      email,
      tenantId,
    );

    if (!user || !user.isActive) {
      throw AuthErrors.INVALID_CREDENTIALS();
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw AuthErrors.INVALID_CREDENTIALS();
    }

    const { accessToken, refreshToken } = this.generateTokenPair({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.updateRefreshToken(user.id, {
      hash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.userRepository.updateLastLogin(user.id);

    const activeModules = await this.featureFlagRepository.findAllByTenant(
      user.tenantId,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        avatarUrl: user.avatarUrl,
      },
      activeModules: activeModules.map((f) => f.moduleKey),
    };
  }

  async refreshToken(userId: string, rawRefreshToken: string) {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      throw AuthErrors.INVALID_REFRESH_TOKEN();
    }

    if (user.refreshTokenExpiresAt < new Date()) {
      throw AuthErrors.INVALID_REFRESH_TOKEN();
    }

    const tokenMatch = await bcrypt.compare(
      rawRefreshToken,
      user.refreshTokenHash,
    );

    if (!tokenMatch) {
      throw AuthErrors.INVALID_REFRESH_TOKEN();
    }

    const { accessToken, refreshToken: newRefreshToken } =
      this.generateTokenPair({
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
      });

    const newHash = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepository.updateRefreshToken(user.id, {
      hash: newHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async revokeSession(userId: string) {
    await this.userRepository.clearRefreshToken(userId);
  }

  private generateTokenPair(payload: {
    userId: string;
    tenantId: string;
    role: string;
  }) {
    const secret = process.env.JWT_SECRET!;

    const accessToken = jwt.sign(
      {
        userId: payload.userId,
        tenantId: payload.tenantId,
        role: payload.role,
      },
      secret,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: payload.userId, tenantId: payload.tenantId },
      secret,
      { expiresIn: "7d" },
    );

    return { accessToken, refreshToken };
  }
}
