import { GetImageQueryDto, ImageManipulationDto, PostImageTemplate, UploadImageDto } from '@dtos/image.dto';
import { ImageInfo, ImageTemplate } from '@entities/image.entity';
import { apiResponse } from '@shared/helper/api-response.helper';
import { catchError } from '@shared/transformer/catch-error.interceptor';
import { minioServer, s3Client, uploader } from '@shared/constants';
import { HttpError } from '@shared/helper/http-error.helper';
import { validateAndTransformRequest } from '@shared/helper/validate-transform.helper';
import { Router } from 'express';
import { Collection } from 'mongodb';
import sharp from 'sharp';
import { getColorFromBuffer, getColors } from '@shared/functions';



export class ImageRouter {
    private router = Router();
    constructor(
        private readonly imageTemplateCollection: Collection<ImageTemplate>,
        private readonly imageInfoCollection: Collection<ImageInfo>,
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

        this.router.get("/image/*", async (req, res) => {
            try {
                const [_, __, bucket, folder] = req.url.split("/");
                const filePath = req.url.split(folder)[1].split("?")[0];
                const file = await s3Client.getObject(`${folder}${filePath}`, bucket);


                if (!file) {
                    throw new HttpError({ status: 404, message: "Image not found!" })
                } else {
                    console.log(req.query.template);

                    let options: GetImageQueryDto;
                    if (req.query.template) {
                        const imageTemplate = await this.imageTemplateCollection.findOne({ template: req.query.template as string });
                        console.log(imageTemplate);

                        if (!imageTemplate) throw new HttpError({ status: 400, message: "Template does not exists!" })
                        options = imageTemplate as unknown as GetImageQueryDto;
                    } else {
                        options = await validateAndTransformRequest(req.query, GetImageQueryDto);
                    }
                    const sharpOption = {
                        failOnError: options.failOnError,
                        limitInputPixels: options.limitInputPixels,
                        sequentialRead: options.sequentialRead,
                        density: options.density,
                        pages: options.pages,
                    };
                    const image = sharp(file.body, sharpOption);




                    const meta = await image.metadata();
                    const resizeOption = {
                        kernel: sharp.kernel.cubic,
                        ...(options.width && { width: options.width || meta.width }),
                        ...(options.height && { height: options.height || meta.height }),
                        fit: options.fit,
                        position: options.position,
                    } as any;
                    const metaOption = {
                        exif: {
                            IFD0: {
                                Copyright: options.copyright
                            }
                        }
                    }
                    let imageOutput = image.resize(resizeOption).withMetadata(metaOption);



                    if (options.type == "jpeg") {
                        const jpegOption = {
                            progressive: options.progressive,
                            trellisQuantisation: options.trellisQuantisation, // Trellis quantization is an algorithm that can improve data compression in DCT-based encoding methods. It is used to optimize residual DCT coefficients after motion estimation in lossy video compression encoders such as Xvid and x264. Trellis quantization reduces the size of some DCT coefficients while recovering others to take their place. 
                            quality: options.quality,
                            force: options.force
                        };
                        imageOutput = imageOutput.jpeg(jpegOption);

                    } else if (options.type == "png") {
                        const pngOption = {
                            progressive: options.progressive,
                            compressionLevel: 6, // 1 to 9
                            adaptiveFiltering: false,
                            palette: false,
                            quality: options.quality
                        };
                        imageOutput = imageOutput.png(pngOption);
                    }

                    if (options.blur) {
                        imageOutput = imageOutput.blur(options.blur)
                    }
                    return imageOutput.pipe(res);
                }

            } catch (error) {
                console.log(error);

                catchError(error, res);
            }
        });

        this.router.post("/image", uploader.single('file'), async (req, res) => {
            try {
                const clearNameRegex = new RegExp(/[^a-zA-Z .]/g);
                const fileName = req.file.originalname.replace(clearNameRegex, "_").replace(".", `_${Date.now()}.`);
                req.body.file = fileName
                const options = await validateAndTransformRequest(req.body, UploadImageDto);


                const imageManipulation = (file: Express.Multer.File): Promise<ImageManipulationDto> => {
                    return new Promise(async (resolve, reject) => {

                        // https://sharp.pixelplumbing.com/api-constructor
                        const image = sharp(
                            file.buffer,
                            {
                                failOnError: options.failOnError,
                                limitInputPixels: options.limitInputPixels,
                                sequentialRead: options.sequentialRead,
                                density: options.density,
                                pages: options.pages,
                            },
                        );
                        const originalImageInfo = await image.metadata();
                        delete originalImageInfo.icc;
                        delete originalImageInfo.iptc;
                        delete originalImageInfo.tifftagPhotoshop;



                        const imageBuffer = await image.resize(
                            {
                                width: options.width || originalImageInfo.width,
                                height: options.height || originalImageInfo.height,
                                fit: options.fit || sharp.fit.cover,
                                position: options.position || sharp.strategy.attention,
                            }
                        ).withMetadata(
                            {
                                ...(options.copyright && {
                                    exif: {
                                        IFD0: {
                                            Copyright: options.copyright
                                        }
                                    }
                                })
                            }
                        ).toBuffer({ resolveWithObject: true });


                        resolve({
                            fileAddress: minioServer.endpoint.replace("9000", "3000/api/image") + `/${options.bucket}/${options.folder}/${options.file}`,
                            fileBuffer: imageBuffer.data,
                            filePath: `${options.folder}/${options.file}`,
                            originalImageInfo,
                            manipulatedImageInfo: imageBuffer.info
                        })
                    });
                }
                const manipulatedImage = await imageManipulation(req.file);
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
                // TODO:  add to db
                const imageInfo = (await this.imageInfoCollection.insertOne({
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


        return this.router;
    }
}

