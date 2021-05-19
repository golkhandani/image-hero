import { Router } from 'express';
import { getAllPrices } from 'src/services';


// Export the base-router
const baseRouter = Router();
baseRouter.use('/', getAllPrices);
export default baseRouter;
