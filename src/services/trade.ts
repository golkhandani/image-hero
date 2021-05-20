import { CreateBuyTradeDto, PayBuyTradeDto, VerifyBuyTradeDto } from "@dtos/trade.dto";
import { ourSource, Price } from "@entities/price.entity";
import { User } from "@entities/user.entity";
import { priceExpirationMinute } from "@shared/constants";
import { HttpError } from "@shared/http-error.helper";
import { CreatePaymentRequestDto, VerifyPaymentRequestDto, ZibalPayment } from "@shared/zibal.helper";
import { plainToClass } from "class-transformer";
import moment from "moment";
import { Collection, ObjectId } from "mongodb";

export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL',
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
  price: Price;
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


export class TradeService {

  constructor(
    private readonly priceCollection: Collection<Price>,
    private readonly tradeCollection: Collection<Trade>,
    private readonly payment: ZibalPayment,
  ) { }


  public async createBuyTradeRequest(user: User, createBuyTradeDto: CreateBuyTradeDto): Promise<Trade> {
    const lastPrice = (await this.priceCollection.aggregate([
      {
        $match: { source: ourSource }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]).toArray())[0]

    const newTrade = new Trade({
      type: TradeType.BUY,
      status: TradeStatus.NOT_PAID,

      amount: createBuyTradeDto.amount,
      walletAddress: createBuyTradeDto.walletAddress,

      price: lastPrice,

      userInfo: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName
      },

      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
      expireAt: moment().add(priceExpirationMinute, "minutes").toDate(),

    });

    const createdTrade = (await this.tradeCollection.insertOne(newTrade)).ops[0];

    return plainToClass(Trade, createdTrade);
  }

  public async payBuyTradeRequest(user: User, payBuyTradeDto: PayBuyTradeDto): Promise<Trade> {
    const existsTrade = await this.tradeCollection.findOne({
      _id: payBuyTradeDto.tradeId
    })

    if (!existsTrade) {
      throw new HttpError({ message: "Invoice has not found. Please contact support!", status: 400 })
    }
    const paymentDto: CreatePaymentRequestDto = {
      amount: existsTrade.amount * existsTrade.price.buy,
    }

    const payment = await this.payment.createPaymentRequest(paymentDto);

    existsTrade.payment = {
      amount: payment.amount,
      gateway: ZibalPayment.name,
      url: payment.url,
      referenceId: payment.trackId!.toString()
    }

    const updatedTrade = (await this.tradeCollection.findOneAndReplace({ _id: existsTrade._id }, existsTrade, { returnOriginal: false })).value;
    return plainToClass(Trade, updatedTrade);
  }

  public async verifyBuyTradeRequest(user: User, verifyBuyTradeDto: VerifyBuyTradeDto): Promise<Trade> {
    const existsTrade = await this.tradeCollection.findOne({
      _id: verifyBuyTradeDto.buyTradeId,
      "payment.referenceId": verifyBuyTradeDto.paymentReferenceId
    });

    if (!existsTrade || !existsTrade.payment || !existsTrade.payment.referenceId) {
      throw new HttpError({ message: "Invoice has not found. Please contact support!", status: 400 })
    }


    const verifyPaymentRequestDto: VerifyPaymentRequestDto = {
      amount: existsTrade.amount,
      trackId: parseFloat(existsTrade.payment.referenceId),
    }
    const verified = await this.payment.VerifyPayment(verifyPaymentRequestDto)

    if (!verified) {
      throw new HttpError({ message: `Invoice payment does not verified by ${ZibalPayment.name}. Please contact support!`, status: 400 })
    }

    existsTrade.status = TradeStatus.PAID;
    existsTrade.payment = {
      amount: existsTrade.payment.amount,
      gateway: existsTrade.payment.gateway,
      url: existsTrade.payment.url,
      paidAt: verified.paidAt,
    }

    const updatedTrade = (await this.tradeCollection.findOneAndReplace({ _id: existsTrade._id }, existsTrade, { returnOriginal: false })).value;

    return plainToClass(Trade, updatedTrade);
  }


}