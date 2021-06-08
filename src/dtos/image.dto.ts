import { toBoolean } from "@shared/transformer/to-boolean.transformer";
import { toColorHex } from "@shared/transformer/to-colorhex.transformer";
import { toInt } from "@shared/transformer/to-int.transformer";
import { Exclude, Expose, Transform } from "class-transformer";
import { IsDefined, IsString, IsOptional, IsBoolean, IsNumber, IsIn, ValidateIf, IsAlpha, IsEnum } from "class-validator";
import sharp from "sharp";


const formats = ["jpeg", "png", "webp"] as const;
type Format = typeof formats[never];

const spaces = ["srgb", "rgb", "cmyk", "lab", "b-w"] as const;
type Space = typeof spaces[never];

export enum Type {
    jpeg = "jpeg",
    png = "png",
    default = "default" // same as input
}

export enum Kernel {
    nearest = "nearest",
    cubic = "cubic",
    mitchell = "mitchell",
    lanczos2 = "lanczos2",
    lanczos3 = "lanczos3"
}
export enum Fit {
    contain = "contain",
    cover = "cover",
    fill = "fill",
    inside = "inside",
    outside = "outside"
}
export enum Position {
    centre = "centre",
    top = "top",
    right_top = "right top",
    right = "right",
    right_bottom = "right bottom",
    bottom = "bottom",
    left_bottom = "left bottom",
    left = "left",
    left_top = "left top",
    attention = "attention", // focus on the region with the highest luminance frequency, colour saturation and presence of skin tones.
    entropy = "entropy" // focus on the region with the highest Shannon entropy

}

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
    @IsEnum(Type)
    type: Type;

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


@Exclude()
export class ImageMetadata {
    @Expose()
    format: Format; // Name of decoder used to decompress image data
    @Expose()
    size: number; // size of image in byte
    @Expose()
    width: number;
    @Expose()
    height: number;
    @Expose()
    space?: Space; // Name of colour space interpretation
    @Expose()
    channels: 3 | 4;
    @Expose()
    density: number; // Number of bands e.g. 3 for sRGB, 4 for CMYK
    @Expose()
    isProgressive: boolean; // Indicating whether the image is interlaced using a progressive scan
    @Expose()
    pages: number;
    @Expose()
    orientation: number;
}
export function isResizeEnabled(obj: GetImageQueryDto, val: boolean) {
    return obj.template !== null && obj.rsz;
}

export function isRotateEnabled(obj: GetImageQueryDto, val: boolean) {
    return obj.template !== null && obj.rtt != null;
}

export function isJpegEnabled(obj: GetImageQueryDto, val: boolean) {
    return obj.template !== null && obj.type == Type.jpeg;
}

export function isPngEnabled(obj: GetImageQueryDto, val: boolean) {
    return obj.template !== null && obj.type == Type.png;
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
    @IsEnum(Fit)
    fit: Fit = Fit.contain;

    @IsOptional()
    @IsEnum(Position)
    position: Position = Position.attention;

}

export class ImageManipulationDto {
    fileBuffer?: Buffer;
    originalImageInfo: sharp.Metadata
    manipulatedImageInfo: sharp.OutputInfo
}


export class GetImageQueryDto {
    @IsOptional()
    @IsString()
    template: string;


    /************************/
    /* Constructor Options  */
    /************************/
    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    // failOnError
    foe: boolean = false;

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    // limitInputPixels
    lip: number | boolean = false;

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    // sequentialRead
    slr: boolean = true;

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    // density
    d: number = 72;


    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    // pages
    ps: number = 1;

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    // page
    p: number = 0;

    /************************/
    /*   Resize Options     */
    /************************/
    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    /**
     * Enable resize for image
     */
    rsz: boolean = false;



    @ValidateIf(isResizeEnabled)
    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    // width
    w?: number;

    @ValidateIf(isResizeEnabled)
    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    // height
    h?: number;

    @ValidateIf(isResizeEnabled)
    @IsOptional()
    @IsEnum(Fit)
    /**
     * When both a width and height are provided, 
     * the possible methods by which the image should fit these are:
     */
    fit: Fit = Fit.contain;

    @ValidateIf(isResizeEnabled)
    @IsOptional()
    @IsEnum(Position)
    // position
    /**
     * Position, gravity or strategy to use when fit is cover or contain
     */
    pos: Position = Position.attention;

    @ValidateIf(isResizeEnabled)
    @IsOptional()
    @IsString()
    @Transform(toColorHex)
    // background
    bgr: string = "#000000";

    @ValidateIf(isResizeEnabled)
    @IsOptional()
    @IsEnum(Kernel)
    // kernel
    /**
     *  The kernel to use for image reduction.
     */
    krn: Kernel = Kernel.nearest;

    @ValidateIf(isResizeEnabled)
    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    // fastShrinkOnLoad
    fsl: boolean = true;



    /************************/
    /*   Operation Options  */
    /************************/

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    /**
     * sigma: A value between 0.3 and 1000 representing the sigma of the Gaussian mask,
     * where sigma = 1 + radius / 2
     */
    blr?: number;



    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    /**
     * Angle of rotation. (optional, default auto)
     */
    rtt?: number;

    @ValidateIf(isRotateEnabled)
    @IsOptional()
    @IsString()
    @Transform(toColorHex)
    /**
     * Background of rotated image
     */
    rtb: string = "#000000";



    @IsOptional()
    @IsString()
    // copyright
    cr: string = "copyright";



    /************************/
    /* Shared Output Option */
    /************************/

    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    // quality
    q: number = 100;

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    // progressive
    prg: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    // force output format
    f: boolean = true;




    @IsOptional()
    @IsEnum(Type)
    type: Type = Type.default;


    /************************/
    /*  JPEG Output Option  */
    /************************/

    @ValidateIf(isJpegEnabled)
    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    // trellisQuantisation
    /**
     * Trellis quantization is an algorithm that can improve data compression in DCT-based encoding methods. It is used to optimize residual DCT coefficients after motion estimation in lossy video compression encoders such as Xvid and x264. Trellis quantization reduces the size of some DCT coefficients while recovering others to take their place. 
     */
    tsq: boolean = false;


    /************************/
    /*   PNG Output Option  */
    /************************/

    @ValidateIf(isPngEnabled)
    @IsOptional()
    @IsNumber()
    @Transform(toInt)
    cpl: number = 6

    @ValidateIf(isPngEnabled)
    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    /**
     * Quantize to a palette-based image with alpha transparency support (optional, default false)
     */
    plt: boolean = false;
}