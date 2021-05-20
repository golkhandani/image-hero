import { ClassConstructor, plainToClass } from "class-transformer";
import { validateOrReject } from "class-validator";

export async function validateAndTransformRequest<T>(data: any, cls: ClassConstructor<T>) {
  const phoneVerification = plainToClass(cls, data);
  await validateOrReject(phoneVerification as any);
  return phoneVerification;
}