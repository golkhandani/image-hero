import { TradeNetwork } from '@entities/trade.entity';
import { toObjectId } from '@shared/to-objectId.transformer';
import { Transform } from 'class-transformer';
import { IsDefined, IsEnum, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateBuyTradeDto {
  @IsDefined()
  @IsString()
  walletAddress: string;

  @IsDefined()
  @IsNumber()
  amount: number;


  @IsDefined()
  @IsEnum(TradeNetwork)
  network: number;
}

export class ConfirmTradeDto {
  @IsDefined()
  @Transform(toObjectId)
  tradeId: ObjectId;
}

export class VerifyBuyTradeDto {
  @IsDefined()
  @Transform(toObjectId)
  tradeId: ObjectId;

  @IsDefined()
  @IsNumber()
  paymentReferenceId: number;
}

export class CreateSellTradeDto {
  @IsDefined()
  @IsString()
  BankAddress: string;

  @IsDefined()
  @IsNumber()
  amount: number;
}