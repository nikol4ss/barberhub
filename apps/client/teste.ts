// // apps/web/src/utils/parse-api-error.ts
// import type {
//   ApiErrorResponse,
//   ValidationErrorResponse,
//   BusinessErrorResponse,
// } from "@barberhub/types";
// import type { AxiosError } from "axios";

// export interface ParsedError {
//   type: "validation" | "business" | "unknown";
//   messages: string[];
//   fields?: Record<string, string>;
// }

// export function parseApiError(err: unknown): ParsedError {
//   // Não é erro Axios
//   if (!(err instanceof Error) || !("response" in err)) {
//     return {
//       type: "unknown",
//       messages: ["Erro inesperado. Tente novamente."],
//     };
//   }

//   const axiosError = err as AxiosError<ApiErrorResponse>;
//   const data = axiosError.response?.data;

//   if (!data) {
//     return {
//       type: "unknown",
//       messages: ["Erro de conexão. Verifique sua internet."],
//     };
//   }

//   // Erro de validação (Zod)
//   if (data.type === "VALIDATION_ERROR") {
//     const validationError = data as ValidationErrorResponse;
//     const fields: Record<string, string> = {};
//     const messages: string[] = [];

//     validationError.errors.forEach((err) => {
//       fields[err.field] = err.message;
//       messages.push(`${err.field}: ${err.message}`);
//     });

//     return {
//       type: "validation",
//       messages,
//       fields, // ← Pode usar para marcar input como erro
//     };
//   }

//   // Erro de negócio (AppError)
//   if (data.type === "BUSINESS_ERROR") {
//     const businessError = data as BusinessErrorResponse;
//     const message = businessError.advice
//       ? `${businessError.message}\n${businessError.advice}`
//       : businessError.message;

//     return {
//       type: "business",
//       messages: [message],
//     };
//   }

//   // Desconhecido
//   return {
//     type: "unknown",
//     messages: [data.message || "Erro inesperado"],
//   };
// }
