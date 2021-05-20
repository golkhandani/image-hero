

import cron from "node-cron"
import { getAbanTetherPrice, getBitTwentyFourTetherPrice, getExNovinTetherPrice, getIranTetherPrice, getTetherLandPrice, TetherPrice } from ".";
import mysql from "mysql2/promise";
import { Collection, Db, ObjectId } from "mongodb";
import moment from "moment";
import { Price } from "@entities/price.entity";

let counter = 0;

export async function runCrawlerScheduler(db: mysql.Connection) {

    cron.schedule('*/10 * * * * *', async () => {
        console.log(new Date(), 'running a task every 1 minutes to get all prices');



        try {
            const [
                abanTetherPrice,
                tetherLandPrice,
                iranTetherPrice,
                exNovinTetherPrice,
                bitTwentyFourTetherPrice
            ] = await Promise.all([
                getAbanTetherPrice(),
                getTetherLandPrice(),
                getIranTetherPrice(),
                getExNovinTetherPrice(),
                getBitTwentyFourTetherPrice()
            ]);

            const prices = [
                abanTetherPrice,
                tetherLandPrice,
                iranTetherPrice,
                exNovinTetherPrice,
                bitTwentyFourTetherPrice
            ].filter(item => item?.Buy != 0 && item?.Sell != 0);

            let tetherPrice: TetherPrice = {
                Source: "OnPay",
                Buy: 0,
                Sell: 0,
            };
            const count = prices.length;
            // get config and then calculate the main price


            // Add price to database
            let insertQuery = 'INSERT INTO OnPay.Prices(SourceName,Sell,Buy) VALUES ';
            for (let index = 0; index < count; index++) {
                const price = prices[index];
                tetherPrice.Buy += price!.Buy / count;
                tetherPrice.Sell += price!.Sell / count;
                insertQuery += ` ('${price.Source}','${price.Sell}','${price.Buy}'),`;

            }
            if (tetherPrice.Buy !== 0 && tetherPrice.Sell !== 0) {
                insertQuery += ` ('${tetherPrice.Source}','${tetherPrice.Sell}','${tetherPrice.Buy}');`;
                await db.query(`${insertQuery};`)
            }
            // End of Add price to database



            console.dir({
                counter: counter++,
                prices,
                tetherPrice
            }, { depth: null, colors: true })

        } catch (error) {
            console.log(error);

        }





    });



}


export async function runMongoCrawlerScheduler(priceCollection: Collection<Price>) {

    cron.schedule('*/10 * * * * *', async () => {
        console.log(new Date(), 'running a task every 1 minutes to get all prices');



        try {
            const [
                abanTetherPrice,
                tetherLandPrice,
                iranTetherPrice,
                exNovinTetherPrice,
                bitTwentyFourTetherPrice
            ] = await Promise.all([
                getAbanTetherPrice(),
                getTetherLandPrice(),
                getIranTetherPrice(),
                getExNovinTetherPrice(),
                getBitTwentyFourTetherPrice()
            ]);

            const prices: Price[] = [
                abanTetherPrice,
                tetherLandPrice,
                iranTetherPrice,
                exNovinTetherPrice,
                bitTwentyFourTetherPrice
            ].filter(item => item?.Buy != 0 && item?.Sell != 0)
                .map(item => new Price({
                    buy: item.Buy,
                    sell: item.Sell,
                    source: item.Source,
                    createdAt: new Date()
                }));

            let onPayTetherPrice = new Price({
                source: "OnPay",
                buy: 0,
                sell: 0,
                createdAt: moment().toDate()
            });
            const count = prices.length;
            // get config and then calculate the main price




            // Add price to database
            for (let index = 0; index < count; index++) {
                const price = prices[index];
                onPayTetherPrice.buy += price!.buy / count;
                onPayTetherPrice.sell += price!.sell / count;

            }
            if (onPayTetherPrice.buy !== 0 && onPayTetherPrice.sell !== 0) {
                await priceCollection.insertMany([onPayTetherPrice].concat(prices));
            }
            // End of Add price to database



            console.dir({
                counter: counter++,
                prices: JSON.stringify(prices),
                onPayTetherPrice: JSON.stringify(onPayTetherPrice)
            }, { depth: null, colors: true })

        } catch (error) {
            console.log(error);

        }





    });



}
