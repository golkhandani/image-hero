import { Fit } from "@enums/fit.enum";
import { ImageType } from "@enums/image-type.enum";
import { Position } from "@enums/position.enum";
import { toBoolean } from "@shared/transformer/to-boolean.transformer";
import { toInt } from "@shared/transformer/to-int.transformer";
import { Transform } from "class-transformer";
import { IsBoolean, IsDefined, IsEnum, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";

export class PostImageTemplate {
    @IsDefined()
    @IsString()
    template: string;

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    failOnError: boolean = false;

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    limitInputPixels: number | boolean = false;

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    sequentialRead: boolean = true;

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    density: number = 72;

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    pages: number = 1;

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    page: number = 0;

    @IsOptional()
    @IsString()
    copyright: string = "Hello";

    @IsDefined()
    @IsNumber()
    @Transform(toInt)
    width: number;

    @IsDefined()
    @IsNumber()
    @Transform(toInt)
    height: number;

    @IsOptional()
    @IsEnum(Fit)
    fit: Fit = Fit.contain;

    @IsOptional()
    @IsEnum(Position)
    position: Position = Position.attention;

    @IsDefined()
    @IsEnum(ImageType)
    type: ImageType;

    @ValidateIf((obj: PostImageTemplate, val: boolean) => {
        return obj.type == "jpeg"
    })
    @IsDefined()
    @IsBoolean()
    @Transform(toBoolean)
    progressive: boolean;

    @ValidateIf((obj: PostImageTemplate, val: boolean) => {
        return obj.type == "jpeg"
    })
    @IsDefined()
    @IsBoolean()
    @Transform(toBoolean)
    trellisQuantisation?: boolean = false; // Trellis quantization is an algorithm that can improve data compression in DCT-based encoding methods. It is used to optimize residual DCT coefficients after motion estimation in lossy video compression encoders such as Xvid and x264. Trellis quantization reduces the size of some DCT coefficients while recovering others to take their place. 


    @ValidateIf((obj: PostImageTemplate, val: boolean) => {
        return obj.type == "jpeg"
    })
    @IsDefined()
    @IsNumber()
    @Transform(toInt)
    quality: number;

    @ValidateIf((obj: PostImageTemplate, val: boolean) => {
        return obj.type == "jpeg"
    })
    @IsDefined()
    @IsBoolean()
    @Transform(toBoolean)
    force: boolean = true;

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    blur?: number;
}