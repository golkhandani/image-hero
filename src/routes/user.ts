import { LoginDto, PhoneVerificationCodeDto, PhoneVerificationDto, RegisterUserInfoDto } from '@dtos/user.dto';
import { OTP } from '@entities/otp.entity';
import { User } from '@entities/user.entity';
import { UserService } from '@services/user';
import { apiResponse } from '@shared/api-response.helper';
import { authMiddleware, RequestWithUser } from '@shared/auth.middleware';
import { catchError } from '@shared/catch-error.interceptor';
import { validateAndTransformRequest } from '@shared/validate-transform.helper';
import { Router } from 'express';




export class UserRouter {
    private router = Router();
    constructor(private readonly userService: UserService) {

    }

    setupRoutes() {
        this.router.get("/auth/phone-verification", async (req, res) => {
            try {
                const body = await validateAndTransformRequest(req.body, PhoneVerificationDto)
                const data = await this.userService.authPhoneVerification(body);
                return res.send(apiResponse<OTP>({ data }));
            } catch (error) {
                catchError(error, res);
            }
        });

        this.router.get("/auth/phone-verification-code", async (req, res) => {
            try {
                const body = await validateAndTransformRequest(req.body, PhoneVerificationCodeDto);
                const data = await this.userService.authPhoneVerificationCode(body);
                return res.send(apiResponse<User>({ data }));
            } catch (error) {
                catchError(error, res);
            }
        });

        this.router.get("/auth/phone-verification-code-resend", async (req, res) => {
            try {
                const body = await validateAndTransformRequest(req.body, PhoneVerificationDto);
                const data = await this.userService.authPhoneVerificationCodeResend(body);
                return res.send(apiResponse<OTP>({ data }));
            } catch (error) {
                catchError(error, res);
            }
        });

        this.router.get("/auth/register-user-info", authMiddleware, async (req, res) => {
            try {
                const user = (req as RequestWithUser).user;
                const body = await validateAndTransformRequest(req.body, RegisterUserInfoDto);
                const data = await this.userService.authRegisterUserInfo(user, body);
                return res.send(apiResponse<User>({ data }));
            } catch (error) {
                catchError(error, res);
            }
        });

        this.router.get("/auth/login", async (req, res) => {
            try {
                const body = await validateAndTransformRequest(req.body, LoginDto);
                const data = await this.userService.authLogin(body);
                return res.send(apiResponse<User>({ data }));
            } catch (error) {
                catchError(error, res);
            }
        });



        return this.router;
    }
}

