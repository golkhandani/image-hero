import { Fit } from "@enums/fit.enum";
import { ImageType } from "@enums/image-type.enum";
import { Kernel } from "@enums/kernel.enum";
import { Position } from "@enums/position.enum";
import { isJpegEnabled, isPngEnabled, isResizeEnabled, isRotateEnabled } from "@shared/functions";
import { toBoolean } from "@shared/transformer/to-boolean.transformer";
import { toColorHex } from "@shared/transformer/to-colorhex.transformer";
import { toInt } from "@shared/transformer/to-int.transformer";
import { Transform } from "class-transformer";
import { IsBoolean, IsDefined, IsEnum, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";

export class PostImageTemplate {
    @IsDefined()
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
    @IsNumber()
    @Transform(toInt)
    // height
    whp?: number;

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
    /**
     * Quality of image has different definition 
     * in jpeg or png 
     * please be aware of how to use it!
     * for png (sets palette to true):
     * use the lowest number of colours 
     * needed to achieve given quality   
     */
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
    @IsEnum(ImageType)
    type: ImageType = ImageType.default;


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
    /**
     * Compression level of png format
     */
    cpl: number = 6

    @ValidateIf(isPngEnabled)
    @IsOptional()
    @IsBoolean()
    @Transform(toBoolean)
    /**
     * Quantize to a palette-based image with alpha transparency support (optional, default false)
     */
    plt: boolean = true;
}