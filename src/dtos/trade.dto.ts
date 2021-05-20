import { toObjectId } from '@shared/to-objectId.transformer';
import { Transform } from 'class-transformer';
import { IsDefined, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateBuyTradeDto {
  @IsDefined()
  @IsString()
  walletAddress: string;

  @IsDefined()
  @IsNumber()
  amount: number;
}

export class PayBuyTradeDto {
  @IsDefined()
  @Transform(toObjectId)
  tradeId: ObjectId;
}

export class VerifyBuyTradeDto {
  @IsDefined()
  @Transform(toObjectId)
  buyTradeId: ObjectId;

  @IsDefined()
  @IsNumber()
  paymentReferenceId: number;
}