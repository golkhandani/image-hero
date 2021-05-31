import { ObjectId } from "mongodb";
import { Pricing } from "./price.entity";
import { User } from "./user.entity";

export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum TradeNetwork {
  K20 = 'K20',
  K10 = 'K10',
}

export enum TradeStatus {
  NOT_PAID = 'NOT_PAID',
  NOT_TRANSFERRED = 'NOT_TRANSFERRED',

  PAID = 'PAID',
  TRANSFERRED = 'TRANSFERRED',

}

export class TradePayment {
  amount: number;
  referenceId?: string;
  paidAt?: Date;
  gateway: string;
  url: string;
}

export type TradeUserInfo = Omit<User, "password" | "status" | "createAt" | "updatedAt" | "sessions">

export class Trade {
  _id: ObjectId;
  type: TradeType;
  userInfo: TradeUserInfo;
  walletAddress?: string;
  bankAddress?: string;
  amount: number;
  price: Pricing;
  status: TradeStatus;
  payment?: TradePayment;
  createdAt: Date;
  updatedAt: Date;
  expireAt: Date;


  constructor(data: Omit<Trade, "_id">) {
    if (data) {
      return Object.assign(this, data);
    }
  }
}
