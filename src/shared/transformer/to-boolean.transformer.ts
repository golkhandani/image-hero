import { TransformFnParams } from "class-transformer";

export const toBoolean = (data: TransformFnParams) => {
  return data.value.toLowerCase() == 'true' ? true : false;
}