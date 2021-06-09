import { EventEmitter } from 'events';
import { Db, MongoClient } from 'mongodb';

import { applicationName, databaseUri } from './constants';
import logger from './logger';

export const dbEmitter = new EventEmitter();


export enum DbState {
    connected,
    disconnected
}
export class MongoConnection {
    private static sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000))

    private static instance: Db;
    private static url: string = databaseUri;
    private static state: DbState = DbState.disconnected;
    private static pingIntervalSeconds: number = 10;
    private static dbName: string = applicationName;


    private static async createInstance() {
        try {
            if (!this.url) {
                throw new Error("Mongodb environment has not set yet!")
            }
            const client = new MongoClient(this.url, { useUnifiedTopology: true });
            const connection = await client.connect();
            this.instance = connection.db(this.dbName);
            this.state = DbState.connected;
            const dbPing = () => {
                return new Promise((resolve, reject) => {
                    client.db("admin").command({ ping: 1 }).then(() => resolve("Database has been disconnected !"));
                    setTimeout(() => {
                        return reject("Database has been disconnected !");
                    }, 1000);
                });
            }
            const handlePing = async () => {
                try {

                    await dbPing()
                    if (this.state == DbState.disconnected) {
                        this.state = DbState.connected;
                        dbEmitter.emit("db-connect", {
                            message: "Database has been disconnected !"
                        });
                    }
                } catch (error) {
                    if (this.state == DbState.connected) {
                        console.log(error);
                        this.state = DbState.disconnected;
                        dbEmitter.emit("db-disconnect", {
                            message: "Database has been disconnected !"
                        });
                    }
                    logger.warn(error);
                }
            }
            setInterval(handlePing, this.pingIntervalSeconds * 1000);
            console.info("Database connection has been created!");
        } catch (error) {
            this.state = DbState.disconnected;
            logger.err(error.message);
            logger.err("There is an error on mongo db connection creation! Retry in " + this.pingIntervalSeconds + " seconds");
            await MongoConnection.sleep(this.pingIntervalSeconds);
            await this.createInstance();
        }
    }
    public static async getInstance(): Promise<Db> {
        if (!this.instance) {
            await this.createInstance();
        }
        return this.instance;
    }
}