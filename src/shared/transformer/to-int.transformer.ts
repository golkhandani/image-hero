import { TransformFnParams } from "class-transformer";
import { ValidationError } from "class-validator";

export const toInt = (v: TransformFnParams) => {
    const num = parseInt(v.value || 0)
    if (Number.isNaN(num)) {
        throw new ValidationError()
    }
    return num;
}

export const toLimit = (v: TransformFnParams) => {
    const num = parseInt(v.value || 10)
    if (Number.isNaN(num)) {
        throw new ValidationError()
    }
    return num;
}

export const toSkip = (v: TransformFnParams) => {
    const num = parseInt(v.value || 0)
    if (Number.isNaN(num)) {
        throw new ValidationError()
    }
    return num;
}

