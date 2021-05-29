import { ObjectId } from "mongodb";

export const ourSource = "OnPay";

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