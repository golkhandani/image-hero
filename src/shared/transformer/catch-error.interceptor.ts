import { ValidationError } from "class-validator";
import { formatValidationErrors } from "../helper/format-validation-error.helper";
import { Response } from 'express';
import { HttpError } from "../helper/http-error.helper";


export function catchError(error: unknown, res: Response) {
    if (Array.isArray(error) && error[0] instanceof ValidationError) {
        if (error[0]) {
            const messages: string[] = formatValidationErrors(error);
            return res.status(400).send({
                meta: {
                    messages: messages,
                    date: new Date()
                }
            });
        }
    } else if (error instanceof HttpError) {
        return res.status(error.status).send({
            meta: {
                messages: [error.message],
                date: new Date()
            }
        })
    } else {
        return res.status(500).send({
            meta: {
                messages: ["Server Error"],
                date: new Date()
            }
        })
    }
}