export interface ValidationErrorResponse {
  type: "ZOD_ERROR";
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export interface BusinessErrorResponse {
  type: "SERVICE_ERROR";
  code: string;
  message: string;
  advice?: string;
  statusCode: number;
}

export interface UnknownErrorResponse {
  type: "UNKNOWN_ERROR";
  message: string;
}

export type ApiErrorResponse =
  | ValidationErrorResponse
  | BusinessErrorResponse
  | UnknownErrorResponse;
