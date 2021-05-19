import { ClassConstructor, plainToClass } from "class-transformer";
import { IsDefined, IsPhoneNumber, Length, validate, validateOrReject, ValidationError } from "class-validator";
import { Request, Response, Router } from "express";
import { AuthService, HttpError } from "src/services/auth";

export class PhoneVerificationDto {
    @IsDefined()
    @IsPhoneNumber()
    phone: string;
  
}

export class AuthRouter {
    private router = Router();
    constructor(private readonly authService: AuthService) {

    }

    setupRoutes() {        
        this.router.get("/auth/phone-verification", async (req, res) => {
            try {
                await validateRequest(req.body, PhoneVerificationDto)
                const data = await this.authService.authPhoneVerification(req.body);
                return res.send(data);
            } catch (error) {
                catchError(error, res);
            }
            
            
        });

        this.router.get("/auth/phone-verification-code", async (req, res) => {
            const phoneVerification = plainToClass(PhoneVerificationDto, req.body);
            const errors = await validate(phoneVerification);
            if(errors[0]) {
                return res.send(errors)
            }            
            // return res.send(await this.authService.authPhoneVerification(req.body));
        });

        return this.router;
    }


}

function formatValidationErrors(errors: ValidationError[]) {
    const messages: string[] = [];
    errors.map(error => {
        return Object.values(error.constraints || []).forEach(item => messages.push(item));
    });
    return messages;
}


function catchError(error: unknown , res: Response) {
    if(Array.isArray(error) && error[0] instanceof ValidationError) {
        if (error[0]) {
            const messages: string[] = formatValidationErrors(error);
            return res.status(400).send({
                meta: {
                    messages: messages
                }
            });
        }
    } else if(error instanceof HttpError) {
        return res.status(error.status).send({
            meta: {
                messages: [error.message]
            }
        })
    } else {
        return res.status(500).send({
            meta: {
                messages: ["Server Error"]
            }
        })
    }
}

async function validateRequest(data: any, cls: ClassConstructor<any>) {
    const phoneVerification = plainToClass(cls, data);
    return await validateOrReject(phoneVerification);
}