import { Db, MongoClient } from "mongodb";


export class MongoConnection {
    private static instance: Db;
    private static url = process.env.DB;


    public static async getInstance(): Promise<Db> {
        if (!this.instance) {
            const connection = await MongoClient.connect(this.url!,{ useUnifiedTopology: true });
            this.instance = connection.db("OnPay");
        }
        return this.instance;
    }
}