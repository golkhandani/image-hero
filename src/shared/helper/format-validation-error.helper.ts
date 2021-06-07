import { ValidationError } from "class-validator";

export function formatValidationErrors(errors: ValidationError[]) {
  const messages: string[] = [];
  errors.map(error => {
      return Object.values(error.constraints || []).forEach(item => messages.push(item));
  });
  return messages;
}
