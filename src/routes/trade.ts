import { CreateBuyTradeDto, CreateSellTradeDto, ConfirmTradeDto, VerifyBuyTradeDto } from '@dtos/trade.dto';
import { LoginDto, PhoneVerificationCodeDto, PhoneVerificationDto, RegisterUserInfoDto } from '@dtos/user.dto';
import { OTP } from '@entities/otp.entity';
import { Trade } from '@entities/trade.entity';
import { User } from '@entities/user.entity';
import { TradeService } from '@services/trade';
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

        // I Have to check the route list and what they will sent to us
        // should check the zibal
        this.router.get("/trade/buy/payment/verify-callback", authMiddleware, async (req, res) => {
           
        });

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
                const param = await validateAndTransformRequest(req.params, ConfirmTradeDto)
                const data = await this.tradeService.payBuyTradeRequest(user, param);
                return res.send(apiResponse<Trade>({ data }));
            } catch (error) {
                catchError(error, res);
            }
        });

        // get payment confirmation
        this.router.get("/trade/buy/:tradeId/payment/:paymentReferenceId", authMiddleware, async (req, res) => {
            try {
                const user = (req as RequestWithUser).user;
                const param = await validateAndTransformRequest(req.params, VerifyBuyTradeDto);
                const data = await this.tradeService.verifyBuyTradeRequest(user, param);
                return res.send(apiResponse<Trade>({ data }));
            } catch (error) {
                catchError(error, res);
            }
        });


        this.router.post("/trade/sell", authMiddleware, async (req, res) => {
            try {
                const user = (req as RequestWithUser).user;
                const body = await validateAndTransformRequest(req.body, CreateSellTradeDto)
                const data = await this.tradeService.createSellTradeRequest(user, body);
                return res.send(apiResponse<Trade>({ data }));
            } catch (error) {
                catchError(error, res);
            }
        });



        this.router.get("/trade/sell/:tradeId/confirm", authMiddleware, async (req, res) => {
            try {
                const user = (req as RequestWithUser).user;
                const param = await validateAndTransformRequest(req.params, ConfirmTradeDto)
                const data = await this.tradeService.paySellTradeRequest(user, param);
                return res.send(apiResponse<Trade>({ data }));
            } catch (error) {
                catchError(error, res);
            }
        });









        return this.router;
    }
}

