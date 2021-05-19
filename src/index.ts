import './pre-start'; // Must be the first import

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';

import express, { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from './routes';
import logger from '@shared/Logger';
// get the client
import mysql from "mysql2/promise";
import { runCrawlerScheduler } from './services/crawler';
import { MongoConnection } from '@shared/database';
import { AuthService } from './services/auth';
import { AuthRouter } from './routes/auth';
// create the connection to database
// Start the server
async function main() {

    const mongoInstance = await MongoConnection.getInstance();
    const mysqlInstance = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: "password",
        database: 'OnPay'
    });

    runCrawlerScheduler(mysqlInstance)
    const port = Number(process.env.PORT || 3000);

    // setup services
    const authService = new AuthService(mongoInstance.collection("User"));
    const authRouter = new AuthRouter(authService).setupRoutes();


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
    app.use('/api', authRouter);

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

    const viewsDir = path.join(__dirname, 'views');
    app.set('views', viewsDir);
    const staticDir = path.join(__dirname, 'public');
    app.use(express.static(staticDir));
    app.get('*', (req: Request, res: Response) => {
        res.sendFile('index.html', { root: viewsDir });
    });


    app.set("db", mysqlInstance);
    app.set("mongo", mongoInstance);
    app.listen(port, () => {
        logger.info('Express server started on port: ' + port);
    });

}
main()
