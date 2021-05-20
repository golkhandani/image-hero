import { CreateBuyTradeDto, PayBuyTradeDto, VerifyBuyTradeDto } from '@dtos/trade.dto';
import { LoginDto, PhoneVerificationCodeDto, PhoneVerificationDto, RegisterUserInfoDto } from '@dtos/user.dto';
import { OTP } from '@entities/otp.entity';
import { User } from '@entities/user.entity';
import { Trade, TradeService } from '@services/trade';
import { apiResponse } from '@shared/api-response.helper';
import { authMiddleware, RequestWithUser } from '@shared/auth.middleware';
import { catchError } from '@shared/catch-error.interceptor';
import { validateAndTransformRequest } from '@shared/validate-transform.helper';
import { Router } from 'express';




export class TradeRouter {
    private router = Router();
    constructor(private readonly tradeService: TradeService) {

    }

    setupRoutes() {
        this.router.post("/trade/buy", authMiddleware, async (req, res) => {
            try {
                const user = (req as RequestWithUser).user;
                const body = await validateAndTransformRequest(req.body, CreateBuyTradeDto)
                const data = await this.tradeService.createBuyTradeRequest(user, body);
                return res.send(apiResponse<Trade>({ data }));
            } catch (error) {                
                catchError(error, res);
            }
        });

        this.router.get("/trade/buy/:tradeId/payment", authMiddleware, async (req, res) => {
            try {
                const user = (req as RequestWithUser).user;
                const param = await validateAndTransformRequest(req.params, PayBuyTradeDto)
                const data = await this.tradeService.payBuyTradeRequest(user, param);
                return res.send(apiResponse<Trade>({ data }));
            } catch (error) {                
                catchError(error, res);
            }
        });

        this.router.get("/trade/buy/verify-callback", authMiddleware, async (req, res) => {
            try {
                const user = (req as RequestWithUser).user;
                const body = await validateAndTransformRequest(req.body, VerifyBuyTradeDto)
                const data = await this.tradeService.verifyBuyTradeRequest(user, body);
                return res.send(apiResponse<Trade>({ data }));
            } catch (error) {                
                catchError(error, res);
            }
        });

        this.router.get("/trade/buy/verify-callback", authMiddleware, async (req, res) => {
            // try {
            //     const user = (req as RequestWithUser).user;
            //     const body = await validateAndTransformRequest(req.body, VerifyBuyTradeDto)
            //     const data = await this.tradeService.createNewBuyRequest(user, body);
            //     return res.send(apiResponse<Trade>({ data }));
            // } catch (error) {                
            //     catchError(error, res);
            // }
        });

      



        return this.router;
    }
}

