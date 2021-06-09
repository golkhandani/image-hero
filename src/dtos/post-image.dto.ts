import { Fit } from "@enums/fit.enum";
import { Position } from "@enums/position.enum";
import { mainBucketName } from "@shared/constants";
import { toBoolean } from "@shared/transformer/to-boolean.transformer";
import { toInt } from "@shared/transformer/to-int.transformer";
import { Transform } from "class-transformer";
import { IsAlpha, IsBoolean, IsDefined, IsEnum, IsNotIn, IsNumber, IsOptional, IsString } from "class-validator";



export class PostImageDto {

    @IsDefined()
    @IsString()
    @IsAlpha()
    @IsNotIn([mainBucketName], { message: "Folder name should not be same as bucket name" })
    folder: string;

    @IsOptional()
    @IsString()
    file: string;

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    failOnError: boolean = false; // true

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    limitInputPixels: number | boolean = false; // 268402689 

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    sequentialRead: boolean = true; // false

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    density: number = 72;

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    pages: number = 1; // number of pages to extract for multi-page input 

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    page: number = 0; // page number to start extracting from for multi-page input

    @IsOptional()
    @IsString()
    copyright: string;

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    width?: number;

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    height?: number;

    @IsOptional()
    @IsEnum(Fit)
    fit: Fit = Fit.contain;

    @IsOptional()
    @IsEnum(Position)
    position: Position = Position.attention;

}