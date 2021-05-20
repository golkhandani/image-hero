import { IsDefined, IsNumber } from "class-validator";
import { HttpError } from "./http-error.helper";
import { validateAndTransformRequest } from "./validate-transform.helper";

const Zibal = require('zibal');

export interface IPaymentRequestResponse {
  trackId?: number;
  result: number;
  message: string;
  statusMessage: string;
  url: string;
  amount: number;
}

export interface IPaymentVerifyResponse {
  paidAt?: Date;
  amount?: number;
  result: number;
  status?: number;
  message: string;
  statusMessage: string;
}




export class CreatePaymentRequestDto {
  @IsDefined()
  @IsNumber()
  amount: number;
}

export class VerifyPaymentRequestDto {
  @IsDefined()
  @IsNumber()
  amount: number;

  @IsDefined()
  @IsNumber()
  trackId: number;

}


export class ZibalPayment {
  private static instance: ZibalPayment;

  private zibal;
  private constructor() {
    // console.log(Zibal.toString());
    
    this.zibal = new Zibal({
      merchant: 'YOUR-MERCHANT-ID',
      callbackUrl: 'https://some-callback-url.tld',
      logLevel: 2
      // 0: none (default in production)
      // 1: error
      // 2: error + info (default)
    });
    return this;
  }

  public static async getInstance() {
    if (!this.instance) {
      this.instance = new ZibalPayment();
    }
    return this.instance;
  }

  public async createPaymentRequest(createPaymentRequestDto: CreatePaymentRequestDto) {
    const data = await validateAndTransformRequest(createPaymentRequestDto, CreatePaymentRequestDto);
    const paymentRequest: IPaymentRequestResponse = await this.zibal.request(data.amount);
    if (paymentRequest.trackId && paymentRequest.result == 100) {
      const url = Zibal.startURL(paymentRequest.trackId);
      if (url) {
        paymentRequest.url = url;
        paymentRequest.amount = createPaymentRequestDto.amount;
        return paymentRequest;
      } else {
        throw new HttpError({ message: 'Can not create zibal url!', status: 432 })
      }
    } else {
      throw new HttpError({ message: paymentRequest.message, status: 432 })
    }
  }

  public async VerifyPayment(verifyPaymentRequestDto: VerifyPaymentRequestDto) {
    const data = await validateAndTransformRequest(verifyPaymentRequestDto, VerifyPaymentRequestDto);
    const paymentVerify: IPaymentVerifyResponse = await this.zibal.verify(data.trackId);
    if (paymentVerify.status == 1 && paymentVerify.amount == data.amount) {
      return paymentVerify;
    } else {
      throw new HttpError({ message: paymentVerify.message, status: 432 })
    }
  }

}

