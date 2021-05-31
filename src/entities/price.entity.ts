import { ObjectId } from "mongodb";


export enum PricingSource {
  afratether = "afratether",
  'salam-crypto' = "salam-crypto",
  nobitex = "nobitex",
  wallex = "wallex",
  arzinja = "arzinja",
  changekon = "changekon",
  abantether = "abantether",
  phinix = "phinix",
  coinnik = "coinnik",
  jibitex = "jibitex",
  arzpaya = "arzpaya",
  bitpin = "bitpin",
  ramzinex = "ramzinex",
  exir = "exir",
  exnovin = "exnovin",
  bittestan = "bittestan",
  
  'OnPay' = "OnPay"
}
export const ourSource = PricingSource.OnPay;

export class Pricing {
  _id: ObjectId;
  source: string;
  buy: number;
  sell: number;
  createdAt: Date;
  constructor(data: Omit<Pricing, '_id'>) {
      return Object.assign(this, data);
  }
}