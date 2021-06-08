import { TransformFnParams } from "class-transformer";

export const toColorHex = (data: TransformFnParams) => {
    return `#${data.value.toLowerCase()}`
}