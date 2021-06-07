import { toBoolean } from "@shared/transformer/to-boolean.transformer";
import { toInt } from "@shared/transformer/to-int.transformer";
import { Transform } from "class-transformer";
import { IsDefined, IsString, IsOptional, IsBoolean, IsNumber, IsIn, ValidateIf, IsAlpha } from "class-validator";
import sharp from "sharp";

const fits = ["contain", "cover", "fill", "inside", "outside"] as const;
type Fit = typeof fits[never];
const positions = ["centre", "top", "right top", "right", "right bottom", "bottom", "left bottom", "left", "left top", "attention", "entropy"] as const;
type Position = typeof positions[never];

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
    @IsIn(fits)
    fit: Fit = sharp.fit.contain;

    @IsOptional()
    @IsIn(positions)
    position: Position = "attention";

    @IsDefined()
    @IsIn(["jpeg", "png"])
    type: "jpeg" | "png";

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

export class GetImageQueryDto {
    @IsOptional()
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

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    width?: number;

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    height?: number;

    @IsOptional()
    @IsIn(fits)
    fit: Fit = sharp.fit.contain;

    @IsOptional()
    @IsIn(positions)
    position: Position = "attention";

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    quality: number = 100;

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    force: boolean = true;

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    blur?: number;

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    progressive: boolean = false;

    @IsOptional()
    @IsIn(["jpeg", "png", "default"])
    type: "jpeg" | "png" | "default" = "default";


    @ValidateIf((obj: PostImageTemplate, val: boolean) => {
        return obj.type == "jpeg"
    })
    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    trellisQuantisation?: boolean = false; // Trellis quantization is an algorithm that can improve data compression in DCT-based encoding methods. It is used to optimize residual DCT coefficients after motion estimation in lossy video compression encoders such as Xvid and x264. Trellis quantization reduces the size of some DCT coefficients while recovering others to take their place. 



}


export class UploadImageDto {

    @IsDefined()
    @IsString()
    @IsAlpha()
    bucket: string;

    @IsDefined()
    @IsString()
    @IsAlpha()
    folder: string;

    @IsDefined()
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
    @IsIn(fits)
    fit: Fit = sharp.fit.contain;

    @IsOptional()
    @IsIn(positions)
    position: Position = "attention";

}

export class ImageManipulationDto {
    fileAddress: string;
    fileBuffer?: Buffer;
    filePath: string;
    originalImageInfo: sharp.Metadata
    manipulatedImageInfo: sharp.OutputInfo
}