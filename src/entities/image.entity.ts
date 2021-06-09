import { Fit } from "@enums/fit.enum";
import { ImageType } from "@enums/image-type.enum";
import { Kernel } from "@enums/kernel.enum";
import { Position } from "@enums/position.enum";
import { ObjectId } from "bson";
import sharp from "sharp";



export const formats = ["jpeg", "png", "webp"] as const;
export type Format = typeof formats[never];

export const spaces = ["srgb", "rgb", "cmyk", "lab", "b-w"] as const;
export type Space = typeof spaces[never];






export class ImageTemplate {
    _id: ObjectId;
    template: string;


    /************************/
    /* Constructor Options  */
    /************************/
    // failOnError
    foe: boolean = false;
    // limitInputPixels
    lip: number | boolean = false;
    // sequentialRead
    slr: boolean = true;
    // density
    d: number = 72;
    // pages
    ps: number = 1;
    // page
    p: number = 0;

    /************************/
    /*   Resize Options     */
    /************************/
    /**
     * Enable resize for image
     */
    rsz: boolean = false;
    // width
    w?: number;
    // height
    h?: number;
    // height
    whp?: number;

    /**
     * When both a width and height are provided, 
     * the possible methods by which the image should fit these are:
     */
    fit: Fit = Fit.contain;
    // position
    /**
     * Position, gravity or strategy to use when fit is cover or contain
     */
    pos: Position = Position.attention;

    // background
    bgr: string = "#000000";

    // kernel
    /**
     *  The kernel to use for image reduction.
     */
    krn: Kernel = Kernel.nearest;
    // fastShrinkOnLoad
    fsl: boolean = true;



    /************************/
    /*   Operation Options  */
    /************************/
    /**
     * sigma: A value between 0.3 and 1000 representing the sigma of the Gaussian mask,
     * where sigma = 1 + radius / 2
     */
    blr?: number;
    /**
     * Angle of rotation. (optional, default auto)
     */
    rtt?: number;
    /**
     * Background of rotated image
     */
    rtb: string = "#000000";
    // copyright
    cr: string = "copyright";



    /************************/
    /* Shared Output Option */
    /************************/
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

    // progressive
    prg: boolean = true;

    // force output format
    f: boolean = true;

    type: ImageType = ImageType.default;


    /************************/
    /*  JPEG Output Option  */
    /************************/

    // trellisQuantisation
    /**
     * Trellis quantization is an algorithm that can improve data compression in DCT-based encoding methods. It is used to optimize residual DCT coefficients after motion estimation in lossy video compression encoders such as Xvid and x264. Trellis quantization reduces the size of some DCT coefficients while recovering others to take their place. 
     */
    tsq: boolean = false;


    /************************/
    /*   PNG Output Option  */
    /************************/

    /**
     * Compression level of png format
     */
    cpl: number = 6
    /**
     * Quantize to a palette-based image with alpha transparency support (optional, default false)
     */
    plt: boolean = true;
}

export class ImageInfo {
    _id: ObjectId;
    originalImageInfo: sharp.Metadata;
    manipulatedImageInfo: sharp.OutputInfo;
    colors: string[];
    fileAddress: string;
    filePath: string;
    fileFolder: string;
    fileBucket: string;
}

export class ImageCache {
    _id: ObjectId;
    requestUrl: string;
    cacheOptions: string;
    fileAddress: string;
    lastGetAt: Date;
}