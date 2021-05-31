import { PricingSource } from '@entities/price.entity';
import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsDefined, IsEnum, IsIn, IsOptional } from 'class-validator';
import moment from 'moment';

export class GetLastDayCandlePricingDto {
  @IsOptional()
  @IsEnum(PricingSource)
  source: PricingSource = PricingSource.OnPay;

  @IsOptional()
  @IsIn([ 1, 5, 10, 15, 30, 60, 24 * 60 ])
  @Type(() => Number)
  candle: number = 15;

  @IsOptional()
  @IsDate()
  @Type(()=> Date)
  from: Date = moment().add(-1 ,"day").toDate();


  @IsOptional()
  @IsDate()
  @Type(()=> Date)
  to: Date = moment().toDate();
}
