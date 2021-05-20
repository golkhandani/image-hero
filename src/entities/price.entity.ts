import { ObjectId } from "mongodb";

export const ourSource = "OnPay";

export class Price {
  _id: ObjectId;
  source: string;
  buy: number;
  sell: number;
  createdAt: Date;
  constructor(data: Omit<Price, '_id'>) {
      return Object.assign(this, data);
  }
}