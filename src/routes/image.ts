import { GetImageQueryDto } from '@dtos/get-image.dto';
import { PostImageTemplate } from '@dtos/post-image-template.dto';
import { PostImageDto } from '@dtos/post-image.dto';
import { ImageCache, ImageInfo, ImageTemplate } from '@entities/image.entity';
import { ImageType } from '@enums/image-type.enum';
import { cacheBucketName, applicationDomain, mainBucketName } from '@shared/constants';
import { getColorFromBuffer, imageManipulation, s3Client, uploader } from '@shared/functions';
import { apiResponse } from '@shared/helper/api-response.helper';
import { HttpError } from '@shared/helper/http-error.helper';
import { validateAndTransformRequest } from '@shared/helper/validate-transform.helper';
import { catchError } from '@shared/transformer/catch-error.interceptor';
import { Router } from 'express';
import { Collection } from 'mongodb';
import sharp from 'sharp';
import slug from 'limax';
import { GetImageInfoDto } from '@dtos/get-image-info.dto';
import { StatusCodes } from 'http-status-codes';

/**
 * A sample for query string of getting an image
 * d=155
 * &rsz=true&w=500&h=200&fit=cover&pos=attention&bgr=ffffff&krn=nearest&fsl=true
 * &blr=1&rtt=94&rtb=155111
 * &type=jpeg&q=2
 * &type=png&q=1&cpl=9
 */

export class ImageRouter {
    private router = Router();
    constructor(
        private readonly imageTemplateCollection: Collection<ImageTemplate>,
        private readonly imageInfoCollection: Collection<ImageInfo>,
        private readonly imageCacheCollection: Collection<ImageCache>,
    ) { }
    setupRoutes() {
        /**
         * If you use this system in a group of minor systems you can
         * use this endpoint to get the health check of system
         */
        this.router.get("/ping", async (req, res) => {
            try {
                return res.send(apiResponse<any>({ data: "ping" }));
            } catch (error) {
                catchError(error, req, res);
            }
        });


        /**
         * Due to various number of options available for getting an image 
         * such as :
         * type=png&q=1&cpl=9
         * d=155
         * rsz=true&w=500&h=200&fit=cover&pos=attention&bgr=ffffff&krn=nearest&fsl=true
         * blr=1
         * rtt=94&rtb=155111
         * Anyone can add a template to system and after that just call get method 
         * with the template name
         * for example thumbnail-blur are equal to type=jpeg&whp=20&blr=100
         */

        this.router.post("/template", async (req, res) => {
            try {
                const options = await validateAndTransformRequest(req.body, PostImageTemplate);
                const imageTemplate = (await this.imageTemplateCollection.insertOne(options)).ops[0];
                return res.send(apiResponse<ImageTemplate>({ data: imageTemplate }));
            } catch (error) {
                catchError(error, req, res);
            }
        });



        /**
         * In order to upload a new image to the system below endpoint should be called
         * Bucket, Folder and file should be provided 
         * Other options are optional and if someone upload an image with options like: 
         * density, width, height, fit or cover the manipulated image will be stored in system 
         * and the original one will be gone for ever !!! :D
         */

        this.router.post("/", uploader.single('file'), async (req, res) => {
            try {

                /************************************************************/
                /*                                                          */
                /*          Validate and transform request body             */
                /*                                                          */
                /************************************************************/
                const options = await validateAndTransformRequest(req.body, PostImageDto);

                /************************************************************/
                /*                                                          */
                /*   Check the filename for using body or original file     */
                /*                                                          */
                /************************************************************/
                /**
                 * All the name (original or user provided) will be filtered
                 * using slug (limax module)
                 * for more information checkout https://github.com/lovell/limax
                 */
                let fileName = '';
                if (options.file) {
                    /**
                     * If user provided a custom name we should attach
                     * the original file extension to the name
                     */
                    const liod = req.file.originalname.lastIndexOf(".");
                    const nl = req.file.originalname.length;
                    const ext = req.file.originalname.substring(liod, nl);
                    fileName = slug(req.body.file) + "-" + Date.now().toString() + ext;
                } else {
                    fileName = slug(req.file.originalname, {
                        separateNumbers: true,
                        separateApostrophes: true,
                        custom: { '.': '.' }
                    }).replace("-.", `-${Date.now()}.`);
                }
                options.file = fileName;




                /************************************************************/
                /*                                                          */
                /*          Manipulate image and get colors                 */
                /*                                                          */
                /************************************************************/
                const fileAddress = applicationDomain + `/${mainBucketName}/${options.folder}/${options.file}`;
                const filePath = `${options.folder}/${options.file}`;
                const manipulatedImage = await imageManipulation(req.file, options);
                const imageColors = await getColorFromBuffer(manipulatedImage.fileBuffer!);



                // upload image to minio(s3)
                await s3Client.putObject(
                    {
                        metadata: {},
                        body: manipulatedImage.fileBuffer!
                    },
                    filePath,
                    mainBucketName
                )
                delete manipulatedImage.fileBuffer;
                const imageInfo = (await this.imageInfoCollection.insertOne({
                    colors: imageColors,
                    fileAddress: fileAddress,
                    fileBucket: mainBucketName,
                    fileFolder: options.folder,
                    filePath: filePath,
                    originalImageInfo: manipulatedImage.originalImageInfo!,
                    manipulatedImageInfo: manipulatedImage.manipulatedImageInfo!
                })).ops[0]
                return res.send(apiResponse<ImageInfo>({
                    data: imageInfo
                }));
            } catch (error) {
                catchError(error, req, res);
            }
        });


        /**
         * All info of the images which are uploaded by this system 
         * will be stored in a mongodb collection called ImageInfo
         * In order to access data of an image below endpoint is available! 
         */
        this.router.get("/info/:imageId", async (req, res) => {

            try {
                const imageId = (await validateAndTransformRequest(req.params, GetImageInfoDto)).imageId;
                const imageInfo = await this.imageInfoCollection.findOne({ _id: imageId });
                if (!imageInfo) {
                    throw new HttpError({ status: StatusCodes.NOT_FOUND, message: "Image with provided id not found!" })
                }
                return res.send(apiResponse<ImageInfo>({ data: imageInfo! }));
            } catch (error) {
                catchError(error, req, res);
            }

        })

        /**
         * All the images which are uploaded by this system 
         * will be stored in a minio bucket
         * In order to access an image below endpoint is available! 
         */
        this.router.get("/*", async (req, res) => {
            if (req.url == "/favicon.ico") return res.end();
            try {

                /************************************************************/
                /*                                                          */
                /*      Check cache for image with same url and options     */
                /*                                                          */
                /************************************************************/
                const cashedImage = (await this.imageCacheCollection.findOneAndUpdate({
                    requestUrl: req.url,
                }, { $set: { lastGetAt: new Date() } })).value;
                if (cashedImage) {
                    const file = await s3Client.getObject(`${cashedImage.fileAddress}`, cacheBucketName);
                    if (file) return sharp(file?.body).pipe(res);
                }

                /************************************************************/
                /*                                                          */
                /*      parse url to find image address in minio            */
                /*                                                          */
                /************************************************************/
                const [_, bucket, folder] = req.url.split("/");

                const filePath = req.url.split(folder)[1].split("?")[0];
                const file = await s3Client.getObject(`${folder}${filePath}`, bucket);


                if (!file) {
                    throw new HttpError({ status: 404, message: "Image not found!" })
                } else {

                    /************************************************************/
                    /*                                                          */
                    /*      parse and validate query to build image             */
                    /*                                                          */
                    /************************************************************/
                    let options: GetImageQueryDto;
                    if (req.query.template) {
                        const imageTemplate = await this.imageTemplateCollection.findOne({ template: req.query.template as string });
                        if (!imageTemplate) throw new HttpError({ status: 400, message: "Template does not exists!" })
                        options = await validateAndTransformRequest(imageTemplate, GetImageQueryDto);
                    } else {
                        options = await validateAndTransformRequest(req.query, GetImageQueryDto);
                    }
                    /************************************************************/
                    /*                                                          */
                    /*      init image by creating sharp object of image        */
                    /*                                                          */
                    /************************************************************/
                    const sharpOption: sharp.SharpOptions = {
                        failOnError: options.foe,
                        limitInputPixels: options.lip,
                        sequentialRead: options.slr,
                        density: options.d,
                        pages: options.ps,
                        page: options.p,
                    };
                    const metaOption: sharp.WriteableMetadata = {
                        exif: {
                            IFD0: {
                                Copyright: options.cr
                            }
                        },
                    }
                    let image = sharp(file.body, sharpOption).withMetadata(metaOption);
                    /**
                     * Having metadata is useful for getting default setting for image
                     */
                    const metadata = await image.metadata();



                    /************************************************************/
                    /*                                                          */
                    /*     adding image manipulation options for output         */
                    /*                                                          */
                    /************************************************************/

                    /**
                     * All setting related to image resizing of sharp
                     */
                    const hasResizeOption = options.w || options.h || options.whp;
                    if (options.rsz || hasResizeOption) {
                        const resizeOption: sharp.ResizeOptions = {
                            kernel: options.krn,

                            // change them based on whp (percentage)
                            ...(!options.w && options.whp && { width: Math.floor((metadata.width!) * (options.whp / 100)) }),
                            ...(!options.w && options.whp && { height: Math.floor((metadata.height!) * (options.whp / 100)) }),
                            // change width or height based on w and h in query
                            ...(options.w && { width: Math.floor(options.w || metadata.width!) }),
                            ...(options.w && { height: Math.floor(options.h || metadata.height!) }),

                            fit: options.fit,
                            position: options.pos,
                            background: options.bgr,
                            fastShrinkOnLoad: options.fsl
                        };
                        image = image.resize(resizeOption);
                    }


                    /**
                     * All setting related to jpeg format of sharp
                     */
                    if (options.type == ImageType.jpeg) {
                        const jpegOption: sharp.JpegOptions = {
                            progressive: options.prg,
                            trellisQuantisation: options.tsq, // Trellis quantization is an algorithm that can improve data compression in DCT-based encoding methods. It is used to optimize residual DCT coefficients after motion estimation in lossy video compression encoders such as Xvid and x264. Trellis quantization reduces the size of some DCT coefficients while recovering others to take their place. 
                            quality: options.q,
                            force: options.f,
                        };
                        image = image.jpeg(jpegOption);
                    }

                    /**
                     * All setting related to png format of sharp
                     */
                    if (options.type == ImageType.png) {
                        const pngOption: sharp.PngOptions = {
                            progressive: options.prg,
                            compressionLevel: options.cpl, // 1 to 9
                            adaptiveFiltering: false,
                            palette: options.plt,
                            quality: options.q,
                            force: options.f
                        };
                        image = image.png(pngOption);
                    }

                    /**
                     * Adding blur effect to sharp image
                     */
                    if (options.blr) {
                        image = image.blur(options.blr)
                    }

                    /**
                     * Change the rotation of sharp image with background (default is black)
                     */
                    if (options.rtt) {
                        const rotateOption: sharp.RotateOptions = {
                            background: options.rtb
                        }
                        image = image.rotate(options.rtt, rotateOption);
                    }

                    /************************************************************/
                    /*                                                          */
                    /*      Add Image to cache bucket and database for future   */
                    /*                                                          */
                    /************************************************************/
                    const cacheOptions = `image:${JSON.stringify(req.query)}`;
                    const cachePath = `${folder}/${Date.now() + filePath}`
                    image.clone().toBuffer().then(buffer => {
                        this.imageCacheCollection.insertOne({
                            cacheOptions: cacheOptions,
                            requestUrl: req.url,
                            fileAddress: cachePath,
                            // then remove image in cache based on lastGetAt 
                            lastGetAt: new Date()
                        }).then(async () => {
                            s3Client.putObject(
                                {
                                    metadata: {},
                                    body: buffer
                                },
                                cachePath,
                                cacheBucketName
                            )
                        })
                    });

                    /************************************************************/
                    /*                                                          */
                    /*      pipe image to output using writable stream          */
                    /*                                                          */
                    /************************************************************/
                    return image.pipe(res);
                }

            } catch (error) {
                catchError(error, req, res);
            }
        });




        return this.router;
    }
}

