import { AppError } from "apps/server/src/lib/app-error";

export const AuthErrors = {
  INVALID_CREDENTIALS: () =>
    new AppError({
      code: "INVALID_CREDENTIALS",
      statusCode: 401,
      message: "Credenciais inválidas",
      advice: "Verifique e-mail e senha.",
    }),

  INVALID_REFRESH_TOKEN: () =>
    new AppError({
      code: "INVALID_REFRESH_TOKEN",
      statusCode: 401,
      message: "Sessão expirada",
      advice: "Faça login novamente.",
    }),

  EMAIL_ALREADY_EXISTS: () =>
    new AppError({
      code: "EMAIL_ALREADY_EXISTS",
      statusCode: 409,
      message: "Este e-mail já está cadastrado",
      advice: "Use outro e-mail ou faça login.",
    }),

  TENANT_SLUG_TAKEN: () =>
    new AppError({
      code: "TENANT_SLUG_TAKEN",
      statusCode: 409,
      message: "Este nome de barbearia já existe",
      advice: "Escolha outro nome.",
    }),
};
