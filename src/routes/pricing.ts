import { Pricing } from '@entities/price.entity';
import { PricingService } from '@services/pricing';
import { apiResponse } from '@shared/api-response.helper';
import { authMiddleware } from '@shared/auth.middleware';
import { catchError } from '@shared/catch-error.interceptor';
import { Router } from 'express';


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

       
        return this.router;
    }
}

