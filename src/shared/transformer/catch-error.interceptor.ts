import { ValidationError } from "class-validator";
import { formatValidationErrors } from "../helper/format-validation-error.helper";
import { Request, Response } from 'express';
import { HttpError } from "../helper/http-error.helper";

export class UploaderError {
    message: string;
    code: string;
    region: string;
    hostname: string;
    retryable: boolean;
}

export function catchError(error: unknown, req: Request, res: Response) {
    let response;
    let status = 500;
    if (Array.isArray(error) && error[0] instanceof ValidationError) {
        if (error[0]) {
            const messages: string[] = formatValidationErrors(error);
            status = 400;
            response = {
                meta: {
                    messages: messages,
                    date: new Date()
                }
            };
        }
    } else if (error instanceof HttpError) {
        status = error.status;
        response = {
            meta: {
                messages: [error.message],
                date: new Date()
            }
        };
    } else if ((error as UploaderError).code) {
        response = {
            meta: {
                messages: [(error as UploaderError).message],
                date: new Date()
            }
        };
    } else {
        response = {
            meta: {
                messages: [
                    "Server Error",
                    (error as Error).message
                ],
                date: new Date()
            }
        };


    }
    if (process.env.NODE_ENV === 'development') {
        response = Object.assign(response, {
            stack: (error as Error).stack
        });
    }

    if (req.headers.accept == 'application/json') {
        return res.status(status).json(response);
    } else {
        return res.status(status).send(`
        <style>
        table.darkTable {
            font-family: "Arial Black", Gadget, sans-serif;
            border: 5px solid #000000;
            background-color: #4A4A4A;
            width: 100%;
            height: 200px;
            text-align: center;
            border-collapse: collapse;
        }
        table.darkTable td, table.darkTable th {
            border: 2px solid #FFFEFD;
            padding: 3px 2px;
        }
        table.darkTable tbody td {
            font-size: 13px;
            color: #E6E6E6;
        }
        table.darkTable tr:nth-child(even) {
            background: #888888;
        }
        table.darkTable thead {
            background: #000000;
            border-bottom: 3px solid #000000;
        }
        table.darkTable thead th {
            font-size: 14px;
            font-weight: bold;
            color: #E6E6E6;
            text-align: center;
            border-left: 2px solid #4A4A4A;
        }
        table.darkTable thead th:first-child {
            border-left: none;
        }
        
        table.darkTable tfoot {
            font-size: 12px;
            font-weight: bold;
            color: #E6E6E6;
            background: #000000;
            background: -moz-linear-gradient(top, #404040 0%, #191919 66%, #000000 100%);
            background: -webkit-linear-gradient(top, #404040 0%, #191919 66%, #000000 100%);
            background: linear-gradient(to bottom, #404040 0%, #191919 66%, #000000 100%);
            border-top: 0px solid #4A4A4A;
        }
        table.darkTable tfoot td {
            font-size: 12px;
        }
        </style>

        <table class="darkTable">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Description</th>
                </tr>
            </thead>
            
            <tbody>
                <tr>
                    <td>Status</td>
                    <td>${status}</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Message</td>
                    <td>${response?.meta.messages.join("---")}</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Stack</td>
                    <td>${response?.stack}</td>
                    <td>-</td>
                </tr>
            </tbody>
            </tr>
        </table>
        `);
    }

}