import 'express-async-errors';
import 'module-alias/register';
import 'reflect-metadata';

import { ImageCache, ImageInfo, ImageTemplate } from '@entities/image.entity';
import { ImageRouter } from '@routes/image';
import { dbEmitter, DbState, MongoConnection } from '@shared/database';
import logger from '@shared/logger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import StatusCodes from 'http-status-codes';
import morgan from 'morgan';
import path from 'path';
import { applicationPort } from '@shared/constants';



// get the client
// create the connection to database
// Start the server
async function main() {
    const app = express();
    const { BAD_REQUEST } = StatusCodes;

    /************************************************************************************
     *                              Set basic express settings
    ************************************************************************************/

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use(compression({ level: 1 }));

    // Show routes called in console during development
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    // Security
    if (process.env.NODE_ENV === 'production') {
        app.use(helmet({
            contentSecurityPolicy: false,
            noSniff: false,
            ieNoOpen: false,
        }));
    }

    /************************************************************************************
     *                              Serve front-end content
    ************************************************************************************/

    const staticDir = path.join(__dirname, 'public');
    app.use(express.static(staticDir));


    app.use(cors())


    /************************************************************************************
     *                              Database error handling
    ************************************************************************************/
    // Handle Database Connect and Reconnect !
    dbEmitter.on("db-disconnect", () => {
        app.set("DbState", DbState.disconnected);
    });
    dbEmitter.on("db-connect", () => {
        app.set("DbState", DbState.connected);
    });
    app.use('/api', (req, res, next) => {
        const appDbState: DbState = app.get("DbState");
        if (appDbState == DbState.disconnected) {
            return res.status(500).send("Nok!");
        } else return next();
    });


    /************************************************************************************
    *                              Database initialization
   ************************************************************************************/
    const mongoInstance = await MongoConnection.getInstance();


    /************************************************************************************
    *                              Setup controllers
    ************************************************************************************/


    const imageRouter = new ImageRouter(
        mongoInstance.collection<ImageTemplate>(ImageTemplate.name),
        mongoInstance.collection<ImageInfo>(ImageInfo.name),
        mongoInstance.collection<ImageCache>(ImageCache.name),
    ).setupRoutes();
    app.use('/', imageRouter);


    // Global error handler
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.err(err, true);
        return res.status(BAD_REQUEST).json({
            error: err.message,
        });
    });

    /************************************************************************************
    *                              Setup application
    ************************************************************************************/

    const port = Number(applicationPort);
    app.listen(port, () => {
        logger.info('Express server started on port: ' + port);
    });
}
main()
