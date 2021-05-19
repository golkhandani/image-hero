import { Db, MongoClient } from "mongodb";


export class MongoConnection {
    private static instance: Db;
    private static url = 'mongodb://localhost:27017';


    public static async getInstance(): Promise<Db> {
        if (!this.instance) {
            const connection = await MongoClient.connect(this.url);
            this.instance = connection.db("OnPay");
        }
        return this.instance;
    }
}