import { FastifyInstance } from "fastify";

import type { ApiErrorResponse } from "@barberhub/types/http/error-response.types";

import { ZodError } from "zod";
import { AppError } from "../../lib/app-error";

export function registerErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(async (error: Error, request, reply) => {
    // Log para debugging
    console.error("[DEBUG_ERROR]", {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: error.message,
      code: error instanceof AppError ? error.config.code : "UNKNOWN",
    });

    let response: ApiErrorResponse;

    // Erro de validação (Zod)
    if (error instanceof ZodError) {
      response = {
        type: "ZOD_ERROR",
        errors: error.issues.map((issue) => ({
          field: issue.path.join(".") || "root",
          message: issue.message,
        })),
      };
      return reply.code(400).send(response);
    }

    // Erro de negócio (AppError)
    if (error instanceof AppError) {
      response = {
        type: "SERVICE_ERROR",
        code: error.config.code,
        message: error.config.message,
        advice: error.config.advice,
        statusCode: error.config.statusCode,
      };
      return reply.code(error.config.statusCode).send(response);
    }

    // Erro desconhecido
    response = {
      type: "UNKNOWN_ERROR",
      message: "Erro interno do servidor.",
    };
    return reply.code(500).send(response);
  });
}
