import { Pricing } from '@entities/price.entity';
import { PricingService } from '@services/pricing';
import { apiResponse } from '@shared/api-response.helper';
import { authMiddleware } from '@shared/auth.middleware';
import { catchError } from '@shared/catch-error.interceptor';
import { validateAndTransformRequest } from '@shared/validate-transform.helper';
import { Router } from 'express';
import { GetLastDayCandlePricingDto } from '@dtos/pricing.dto'

export class PricingRouter {
    private router = Router();
    constructor(private readonly pricingService: PricingService) {

    }

    setupRoutes() {

        // I Have to check the route list and what they will sent to us
        // should check the zibal
        this.router.get("/pricing/last-day", async (req, res) => {
            try {

                const data = await this.pricingService.getLastDayPricing();
                return res.send(apiResponse<Pricing[]>({ data }));
            } catch (error) {
                catchError(error, res);
            }
        });

        this.router.get("/pricing/last-day-candle", async (req, res) => {
            try {
                const query = await validateAndTransformRequest(req.query, GetLastDayCandlePricingDto)
                const data = await this.pricingService.getLastDayCandlePricing(query);
                return res.send(apiResponse<Pricing[]>({ data }));
            } catch (error) {
                console.log(error);
                
                catchError(error, res);
            }
        });


        return this.router;
    }
}

