# Image Hero
Image manipulator using sharp api

# Technologies

## Sharp
`Sharp` is an image editor for nodejs with c/c++ code which makes it fast and reliable;
We also used `image-pal-sharp` plugin in order to extract colors of image as hex;

You can see the full documentation of [sharp](https://sharp.pixelplumbing.com/) and [image-pal](https://github.com/asilvas/image-pal) and for any related questions!


## Minio
`Minio` is an object storage with `S3` compatible API. It is easy to use and fast enough for any small to medium business!
For working with `minio`, we use a package called `@relaycorp/object-storage` which is a wrapper around different `S3` sdk in `nodejs` platform.

## MongoDB

`MongoDB` is a document based database which is perfect for working with files, due to different info structure of files.

## Redis
...

## Nodejs
`nodejs` is a framework to develop backend services with `javascript`;
The framework is fully match with nature of this project due to non-blocking architecture of `nodejs`.
`nodejs` is powerful in working with files and streams and easy to understand.

## Express
`Express` is a minimal framework to develop server-side application using `nodejs`. 



# DTO
To validate and transform input object, we used dto file with power of `typescript`, `class-validator` and `class-transformer` which are decorator based object mapper and validator.



# Endpoints

The main application only has 5 endpoint!

1. heath check :  
>`GET /ping` 

If you use this system in a group of minor systems you can
use this endpoint to get the health check of system

```ts
// This endpoint has no validation
```

2. creating a template: 
>`POST /template`

Due to various number of options available for getting an image 
such as :
```ts
`type=png&q=1&cpl=9`

`d=155`

`rsz=true&w=500&h=200&fit=cover&pos=attention&bgr=ffffff&krn=nearest&fsl=true`

`blr=1`

`rtt=94&rtb=155111`
```
Anyone can add a template to system and after that just call get method 
with the template name
for example `thumbnail-blur` are equal to `type=jpeg&whp=20&blr=100`

```ts
// dto class for validation

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
     * Trellis quantization is an algorithm that can improve 
     * data compression in DCT-based encoding methods. 
     * It is used to optimize residual DCT coefficients after motion estimation in 
     * lossy video compression encoders such as Xvid and x264. 
     * Trellis quantization reduces the size of some DCT coefficients 
     * while recovering others to take their place. 
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

```

3. upload an image: 
>`POST /`


In order to upload a new image to the system below endpoint should be called
Bucket, Folder and file should be provided 
Other options are optional and if someone upload an image with options like: 
density, width, height, fit or cover the manipulated image will be stored in system 
and the original one will be gone for ever !!! :D
```ts
// dto class for validation

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

```
4. get image info by its id: 
> `GET /info/{imageId}`

All info of the images which are uploaded by this system 
will be stored in a mongodb collection called ImageInfo
In order to access data of an image below endpoint is available! 

```ts
// dto class for validation
export class GetImageInfoDto {
    @IsDefined()
    @Transform(toObjectId)
    imageId: ObjectId;
}
```
5. get image with manipulations: 
>`GET /*`


All the images which are uploaded by this system 
will be stored in a minio bucket
In order to access an image below endpoint is available! 

```ts
// dto class for validation



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
    @Min(0)
    @Max(100)
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
     * Trellis quantization is an algorithm that can improve 
     * data compression in DCT-based encoding methods. 
     * It is used to optimize residual DCT coefficients after motion estimation in 
     * lossy video compression encoders such as Xvid and x264. 
     * Trellis quantization reduces the size of some DCT coefficients 
     * while recovering others to take their place. 
     */
    tsq: boolean = false;


    /************************/
    /*   PNG Output Option  */
    /************************/

    @ValidateIf(isPngEnabled)
    @IsOptional()
    @IsNumber()
    @Min(2)
    @Max(10)
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
     * Quantize to a palette-based image with alpha transparency support 
     * (optional, default false)
     */
    plt: boolean = true;
}
```
# Entities

Application has 3 different entity for `file info`, `template` and `cache file`, 

```ts

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
     * Trellis quantization is an algorithm that can improve 
     * data compression in DCT-based encoding methods. 
     * It is used to optimize residual DCT coefficients after motion estimation in 
     * lossy video compression encoders such as Xvid and x264. 
     * Trellis quantization reduces the size of some DCT coefficients 
     * while recovering others to take their place. 
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
```
