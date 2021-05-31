import './pre-start'; // Must be the first import
import "reflect-metadata";

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';


import express, { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import 'express-async-errors';

import logger from '@shared/logger';
// get the client
import mysql from "mysql2/promise";
import { runCrawlerScheduler, runMongoCrawlerScheduler, runTokenBazCrawler } from './services/crawler';
import { MongoConnection } from '@shared/database';
import { UserRouter } from './routes/user';
import { UserService } from './services/user';
import { Pricing } from '@entities/price.entity';
import { User } from '@entities/user.entity';
import { OTP } from '@entities/otp.entity';
import { TradeRouter } from '@routes/trade';
import { TradeService } from '@services/trade';
import { ZibalPayment } from '@shared/zibal.helper';
import { Trade } from '@entities/trade.entity';
import { PricingRouter } from '@routes/pricing';
import { PricingService } from '@services/pricing';
import  cors from 'cors';
// create the connection to database
// Start the server
async function main() {

    const mongoInstance = await MongoConnection.getInstance();

    // runMongoCrawlerScheduler(mongoInstance.collection(Pricing.name));
    runTokenBazCrawler(mongoInstance.collection(Pricing.name + "-TokenBaz"))
    const port = Number(process.env.PORT || 3000);

   

    const app = express();
    const { BAD_REQUEST } = StatusCodes;



    /************************************************************************************
     *                              Set basic express settings
     ***********************************************************************************/

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Show routes called in console during development
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    // Security
    if (process.env.NODE_ENV === 'production') {
        app.use(helmet());
    }

    // Add APIs
    // setup services
     /************************************************************************************
     *                              Setup controllers
     ***********************************************************************************/
    // const zibalInstance = await ZibalPayment.getInstance();
    // const authService = new UserService(
    //     mongoInstance.collection(User.name),
    //     mongoInstance.collection(OTP.name)
    // );
    // const authRouter = new UserRouter(authService).setupRoutes();

    // const tradeService = new TradeService(
    //     mongoInstance.collection(Price.name),
    //     mongoInstance.collection(Trade.name),
    //     zibalInstance,
    // );
    // const tradeRouter = new TradeRouter(tradeService).setupRoutes();
    // app.use('/api', authRouter);
    // app.use('/api', tradeRouter);

    app.use(cors())
    const pricingService = new PricingService(
        mongoInstance.collection(Pricing.name + "-TokenBaz"),
    );
    const pricingRouter = new PricingRouter(pricingService).setupRoutes();
    app.use('/api', pricingRouter);

    // Print API errors
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.err(err, true);
        return res.status(BAD_REQUEST).json({
            error: err.message,
        });
    });



    /************************************************************************************
     *                              Serve front-end content
     ***********************************************************************************/

    // const viewsDir = path.join(__dirname, 'views');
    // app.set('views', viewsDir);
    // const staticDir = path.join(__dirname, 'public');
    // app.use(express.static(staticDir));
    // app.get('*', (req: Request, res: Response) => {
    //     res.sendFile('index.html', { root: viewsDir });
    // });


    // app.set("db", mysqlInstance);
    app.set("mongo", mongoInstance);
    app.listen(port, () => {
        logger.info('Express server started on port: ' + port);
    });

}
main()
