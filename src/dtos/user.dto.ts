import { toObjectId } from "@shared/to-objectId.transformer";
import { Transform } from "class-transformer";
import { IsDefined, IsEmail, IsPhoneNumber, IsString, ValidateIf } from "class-validator";
import { ObjectId } from "mongodb";

export class PhoneVerificationDto {
  @IsDefined()
  @IsPhoneNumber()
  phone: string;
}

export class PhoneVerificationCodeDto {
  @IsDefined()
  @Transform(toObjectId)
  phoneVerificationId: ObjectId;

  @IsDefined()
  @IsString()
  code: string;

}

export class TokenDto {
  @IsDefined()
  @IsString()
  token: string;
}

export class LoginDto {
  @IsDefined()
  @IsPhoneNumber()
  phone: string;

  @IsDefined()
  @IsString()
  password: string;
}


export class RegisterUserInfoDto {
  @IsDefined()
  @IsString()
  firstName: string;

  @IsDefined()
  @IsString()
  lastName: string;

  @IsDefined()
  @IsString()
  password: string;

  @IsDefined()
  @IsEmail()
  email: string;
}