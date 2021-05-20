import { CreateBuyTradeDto, PayBuyTradeDto, VerifyBuyTradeDto } from "@dtos/trade.dto";
import { ourSource, Price } from "@entities/price.entity";
import { Trade, TradeStatus, TradeType } from "@entities/trade.entity";
import { User } from "@entities/user.entity";
import { priceExpirationMinute } from "@shared/constants";
import { HttpError } from "@shared/http-error.helper";
import { CreatePaymentRequestDto, VerifyPaymentRequestDto, ZibalPayment } from "@shared/zibal.helper";
import { plainToClass } from "class-transformer";
import moment from "moment";
import { Collection, ObjectId } from "mongodb";


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
      throw new HttpError({ message: "Invoice has not found. Please contact support!", status: 400 });
    } else if(existsTrade && moment(existsTrade.expireAt).isAfter(new Date())) {
      throw new HttpError({ message: "Invoice has been expired.", status: 400 })
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