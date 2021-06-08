import { GetImageQueryDto, ImageManipulationDto, PostImageTemplate, Type, UploadImageDto } from '@dtos/image.dto';
import { ImageCache, ImageInfo, ImageTemplate } from '@entities/image.entity';
import { cacheBucketName, clearNameRegex, domain, minioServer, s3Client, uploader } from '@shared/constants';
import { getColorFromBuffer, imageManipulation } from '@shared/functions';
import { apiResponse } from '@shared/helper/api-response.helper';
import { HttpError } from '@shared/helper/http-error.helper';
import { validateAndTransformRequest } from '@shared/helper/validate-transform.helper';
import { catchError } from '@shared/transformer/catch-error.interceptor';
import { Router } from 'express';
import { Collection } from 'mongodb';
import sharp from 'sharp';

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
        this.router.get("/image/ping", async (req, res) => {
            try {
                return res.send(apiResponse<any>({ data: "ping" }));
            } catch (error) {
                catchError(error, res);
            }
        });
        this.router.post("/image/template", async (req, res) => {
            try {
                const options = await validateAndTransformRequest(req.body, PostImageTemplate);
                const imageTemplate = (await this.imageTemplateCollection.insertOne(options)).ops[0];
                return res.send(apiResponse<ImageTemplate>({ data: imageTemplate }));
            } catch (error) {
                catchError(error, res);
            }
        });
        this.router.post("/image", uploader.single('file'), async (req, res) => {
            try {
                /************************************************************/
                /*                                                          */
                /*   Check the filename for using body or original file     */
                /*                                                          */
                /************************************************************/
                const fileName = req.file.originalname.replace(clearNameRegex, "").replace(".", `_${Date.now()}.`);
                req.body.file = fileName;


                /************************************************************/
                /*                                                          */
                /*          Validate and transform request body             */
                /*                                                          */
                /************************************************************/
                const options = await validateAndTransformRequest(req.body, UploadImageDto);


                /************************************************************/
                /*                                                          */
                /*          Validate and transform request body             */
                /*                                                          */
                /************************************************************/
                const fileAddress = minioServer.endpoint.replace("9000", domain) + `/${options.bucket}/${options.folder}/${options.file}`;
                const filePath = `${options.folder}/${options.file}`;
                const manipulatedImage = await imageManipulation(req.file, options);
                const imageColors = await getColorFromBuffer(manipulatedImage.fileBuffer!);



                // upload image to minio(s3)
                await s3Client.putObject(
                    {
                        metadata: {},
                        body: manipulatedImage.fileBuffer!
                    },
                    `${options.folder}/${options.file}`,
                    options.bucket
                )
                delete manipulatedImage.fileBuffer;
                const imageInfo = (await this.imageInfoCollection.insertOne({
                    fileAddress,
                    filePath,
                    fileFolder: options.folder,
                    fileBucket: options.bucket,
                    ...manipulatedImage,
                    colors: imageColors
                })).ops[0]
                return res.send(apiResponse<ImageInfo>({
                    data: imageInfo
                }));
            } catch (error) {
                catchError(error, res);
            }
        });



        this.router.get("/image/*", async (req, res) => {
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
                    const file = await s3Client.getObject(`${cashedImage.cacheUrl}`, cacheBucketName);
                    return sharp(file?.body).pipe(res);
                }

                /************************************************************/
                /*                                                          */
                /*      parse url to find image address in minio            */
                /*                                                          */
                /************************************************************/
                const [_, __, bucket, folder] = req.url.split("/");
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
                        console.log(imageTemplate);
                        if (!imageTemplate) throw new HttpError({ status: 400, message: "Template does not exists!" })
                        options = imageTemplate as unknown as GetImageQueryDto;
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
                    if (options.rsz) {
                        const resizeOption: sharp.ResizeOptions = {
                            kernel: options.krn,
                            ...(options.w && { width: options.w || metadata.width }),
                            ...(options.h && { height: options.h || metadata.height }),
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
                    if (options.type == Type.jpeg) {
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
                    if (options.type == Type.png) {
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
                            cacheUrl: cachePath,
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
                catchError(error, res);
            }
        });




        return this.router;
    }
}

