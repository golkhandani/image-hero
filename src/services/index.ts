import StatusCodes from 'http-status-codes';
import { Request, Response } from 'express';
import fetch from "node-fetch";

import mysql from "mysql2/promise";
import * as cheerio from 'cheerio';
import { Pricing } from '@entities/price.entity';



const webServices = {
    "AbanTether": {
        "SourceName": "AbanTether",
        "URL": "https://abantether.com/eapi/api/Portfolio/GetNewMainPortfolio"
    },
    "TetherLand": {
        "SourceName": "TetherLand",
        "Sell": "https://tetherland.net/data/api/tether_sellprice",
        "Buy": "https://tetherland.net/data/api/tether_price"
    },
    "IranTether": {
        "SourceName": "IranTether",
        "URL": "https://tetheriran.com/cryptocurrency/%D8%AA%"
    },
    "TokenBaz": {
        "SourceName": "TokenBaz",
        "URL": "https://tokenbaz.com/get/prices?coin=usdt&sort=buy_price"
    },
    "ExNovin": {
        "SourceName": "ExNovin",
        "URL": "https://api.exnovin.io/v1/best-prices"
    },
    "BitTwentyFour": {
        "SourceName": "BitTwentyFour",
        "URL": "http://bit24.cash"
    }
}


export interface AbanTetherResponse {
    data: AbanTetherData[];
}

export interface AbanTetherData {
    name: string;
    english: string;
    symbol: string;
    icon: string;
    usdt: number;
    irrbuy: number;
    irrsell: number;
    value: number;
    balance: number;
    blocked: number;
    fav: number;
}


export interface TetherPrice {
    // where we find these prices
    Source: string;

    // price that they buy your tether with
    Buy: number;

    // price that they sell tether to you
    Sell: number;
}



export interface ExNovinData {
    pair: string;
    bestBuy: string;
    bestSell: string;
    lastPrice: number;
    vol24Quote: string;
    vol24Base: string;
    bestBuyAmount: string;
    bestSellAmount: string;
    change24Percentage: number;
}


export interface BitTwentyFour {
    id: number;
    icon: string;
    thumbnail: string;
    name: string;
    persian_name: string;
    capacity: number;
    symbol: string;
    binance_symbol: string;
    coinmarket_symbol: string;
    memo_name: null;
    chart: string;
    price_usd: string;
    price_irt: string;
    change: string;
    market_cap: number;
    volume: number;
    transfer_fee: string;
    buy_percent: string;
    sell_percent: string;
    point_number: number;
    example_txid: null;
    status: number;
    min_buy: null;
    enable_buy: number;
    enable_sell: number;
    admin_confirmed: number;
    created_at: Date;
    updated_at: Date;
    articles_count: number;
}


export class TokenBazCoin {
    class_name:           string;
    logo:                 string;
    label:                string;
    title:                string;
    type_label:           string;
    site_with_source:     string;
    rate:                 number;
    exchange_title:       string;
    id:                   number;
    fee:                  string;
    total_rate:           number;
    buy_price:            string;
    buy_price_formatted:  string;
    sell_price:           string;
    sell_price_formatted: string;
    is_best_buy_price:    number;
    is_best_sell_price:   number;
}




export async function getAbanTetherPrice() {
    try {
        const abanTether = await fetch(webServices.AbanTether.URL, {
            method: 'get',
        })
        const abanTetherResponse: AbanTetherResponse = await abanTether.json();
    
        const abanTetherPrice = abanTetherResponse.data.find(currency => {
            return currency.english.toLowerCase() == "tether";
        })
    
        const tetherPrice: TetherPrice = {
            Buy: abanTetherPrice!.irrbuy,
            Sell: abanTetherPrice!.irrsell,
            Source: webServices.AbanTether.SourceName,
        }
        return tetherPrice;
    } catch (error) {
        const tetherPrice: TetherPrice = {
            Buy: 0,
            Sell: 0,
            Source: webServices.AbanTether.SourceName,
        }
        return tetherPrice;
        
    }
   
   
}


export async function getTetherLandPrice() {
    try {
        const [tetherLandSell, tetherLandBuy] = await Promise.all([
            fetch(webServices.TetherLand.Sell, {
                method: 'get',
            }),
            fetch(webServices.TetherLand.Buy, {
                method: 'get',
            }),
        ])
    
        const tetherPrice: TetherPrice = {
            Buy: (await tetherLandSell.json()).price,
            Sell: (await tetherLandBuy.json()).price,
            Source: webServices.TetherLand.SourceName
        }
        return tetherPrice;
    } catch (error) {
        const tetherPrice: TetherPrice = {
            Buy: 0,
            Sell: 0,
            Source: webServices.TetherLand.SourceName
        }
        return tetherPrice;
    }
}


export async function getIranTetherPrice() {
    try {
        const data = await fetch(webServices.IranTether.URL, {
            method: 'get',
        });
    
        const $ = cheerio.load(await data.text(), {
            xml: {
                normalizeWhitespace: true,
            },
        });
        const tetherPrice: TetherPrice = {
            Buy:  parseInt($('.p1ba').text().replace(",", "")),
            Sell: parseInt($('.p1sa').text().replace(",", "")),
            Source: webServices.IranTether.SourceName
        }
        return tetherPrice;
    } catch (error) {
        const tetherPrice: TetherPrice = {
            Buy: 0,
            Sell: 0,
            Source: webServices.IranTether.SourceName
        }
        return tetherPrice;
    }
}

export async function getTokenBazPrice(): Promise<Pricing[]> {
    try {
        const data = await fetch(webServices.TokenBaz.URL, {
            method: 'get',
        });
        const coins: TokenBazCoin[] =  await data.json()
        
        return coins.map(coin => {
            const tetherPrice: Pricing  = new Pricing({
                buy: parseFloat(coin.buy_price),
                sell: parseFloat(coin.sell_price),
                source: coin.exchange_title,
                createdAt : new Date()
            })
            return tetherPrice;
        });
    } catch (error) {
        const tetherPrice: Pricing = new Pricing({
            buy: 0,
            sell: 0,
            source: webServices.TokenBaz.SourceName,
            createdAt: new Date()
        })
        return [tetherPrice];
    }
}




export async function getExNovinTetherPrice() {
    try {
        const exNovinTether = await fetch(webServices.ExNovin.URL, {
            method: 'get',
        })
        const exNovinTetherResponse: ExNovinData[] = await exNovinTether.json();
    
        const exNovinTetherPrice = exNovinTetherResponse.find(currency => {
            return currency.pair.toUpperCase() == "USDT/TMN";
        })
    
        const tetherPrice: TetherPrice = {
            Buy: parseInt(exNovinTetherPrice!.bestSell),
            Sell: parseInt(exNovinTetherPrice!.bestBuy),
            Source: webServices.ExNovin.SourceName,
        }
        return tetherPrice;
    } catch (error) {
        const tetherPrice: TetherPrice = {
            Buy: 0,
            Sell: 0,
            Source: webServices.ExNovin.SourceName,
        }
        return tetherPrice;
    }
    
}

export async function getBitTwentyFourTetherPrice() {
    try {
        const data = await fetch(webServices.BitTwentyFour.URL, {
            method: 'get',
        });
        const txt = await data.text()
        const coins: BitTwentyFour[] = eval(
            txt.split("function getCoin(symbol)")[1]
                .split("const coins = ")[1]
                .split("return coins.find(coin => coin.symbol === symbol);")[0]
        );
        const BitTwentyFourTetherPrice = coins.find(coin => coin.symbol.toUpperCase() == "USDT") as BitTwentyFour;
    
        const price = parseFloat(BitTwentyFourTetherPrice.price_irt);
    
        const buyFromPercent = (price / 100) * (+BitTwentyFourTetherPrice.buy_percent);
        const sellToPercent = (price / 100) * (+BitTwentyFourTetherPrice.sell_percent);
    
    
        const tetherPrice: TetherPrice = {
            Buy: price + buyFromPercent,
            Sell: price - sellToPercent,
            Source: webServices.BitTwentyFour.SourceName,
        }
        return tetherPrice;
    } catch (error) {
        const tetherPrice: TetherPrice = {
            Buy: 0,
            Sell: 0,
            Source: webServices.BitTwentyFour.SourceName,
        }
        return tetherPrice;
    }
    
    
}




/**
 * Get all users.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export async function getAllPrices(req: Request, res: Response) {

    const db = req.app.get("db") as mysql.Connection;

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
    ])


    return res.status(StatusCodes.OK).json({
        data: {
            abanTetherPrice,
            tetherLandPrice,
            iranTetherPrice,
            exNovinTetherPrice,
            bitTwentyFourTetherPrice
        }
    });

}
