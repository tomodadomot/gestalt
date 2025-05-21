// AppError型定義
export type ValidationError = {
  type: "ValidationError";
  field: string;
  message: string;
};

export type OpenAIError = {
  type: "OpenAIError";
  message: string;
};

export type D1Error = {
  type: "D1Error";
  message: string;
};

export type AppError = ValidationError | OpenAIError | D1Error;
