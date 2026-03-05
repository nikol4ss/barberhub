export class AppError extends Error {
  constructor(
    public config: {
      code: string;
      statusCode: number;
      message: string;
      advice?: string;
    },
  ) {
    super(config.message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
