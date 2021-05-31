import { PricingSource } from '@entities/price.entity';
import { Type } from 'class-transformer';
import { IsDefined, IsEnum, IsIn, IsOptional } from 'class-validator';

export class GetLastDayCandlePricingDto {
  @IsOptional()
  @IsEnum(PricingSource)
  source: PricingSource = PricingSource.OnPay;

  @IsOptional()
  @IsIn([ 1, 5, 10, 15, 30, 60, 24 * 60 ])
  @Type(() => Number)
  candle: number = 15;
}
