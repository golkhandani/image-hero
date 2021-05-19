

import cron from "node-cron"
import { getAbanTetherPrice, getBitTwentyFourTetherPrice, getExNovinTetherPrice, getIranTetherPrice, getTetherLandPrice, TetherPrice } from ".";
import mysql from "mysql2/promise";

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
            ].filter(item=> item?.Buy != 0 && item?.Sell != 0);
            
            let tetherPrice: TetherPrice = {
                Source: "OnPay",
                Buy: 0,
                Sell: 0,
            };
            const count = prices.length;
            // get config and then calculate the main price            
            let insertQuery = 'INSERT INTO OnPay.Prices(SourceName,Sell,Buy) VALUES ';
    
            for (let index = 0; index < count; index++) {
                const price = prices[index];
                tetherPrice.Buy += price!.Buy / count;
                tetherPrice.Sell += price!.Sell / count;
                insertQuery += ` ('${price.Source}','${price.Sell}','${price.Buy}'),`;
                
            }            
            if(tetherPrice.Buy !== 0 && tetherPrice.Sell !== 0) {
                insertQuery += ` ('${tetherPrice.Source}','${tetherPrice.Sell}','${tetherPrice.Buy}');`;
                await db.query(`${insertQuery};`)
            }
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
