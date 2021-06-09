import { GetImageQueryDto } from '@dtos/get-image.dto';
import { ImageManipulationDto } from '@dtos/image-manipulation.dto';
import { PostImageDto } from '@dtos/post-image.dto';
import { ImageType } from '@enums/image-type.enum';
import { AdapterType, initObjectStoreClient } from '@relaycorp/object-storage';
import multer from 'multer';
import sharp from 'sharp';
import { minioServer } from './constants';
import logger from './logger';



export const s3Client = initObjectStoreClient(
    "minio" as AdapterType,
    minioServer.endpoint,
    minioServer.access,
    minioServer.secret,
    minioServer.tls
);




export const uploaderMemoryStorage = multer.memoryStorage();
const uploaderOptions: multer.Options = {
    storage: uploaderMemoryStorage
};

export const uploader = multer(uploaderOptions);


export const pErr = (err: Error) => {
    if (err) {
        logger.err(err);
    }
};

export const getRandomInt = () => {
    return Math.floor(Math.random() * 1_000_000_000_000);
};


export const getColors = require('image-pal-sharp/lib/rgb');

export const getColorFromBuffer = (buffer: Buffer): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        getColors({
            srcBuffer: buffer,
            order: 'density'
        }, (err: Error, colors: any[]) => {
            const colorPlate: string[] = [];
            if (err) return void console.error('oops!', err.stack || err);
            for (let index = 0; index < colors.length; index++) {
                const color = colors[index];
                colorPlate.push(color.hex);
            }
            resolve(colorPlate)

        });
    })
}

export const imageManipulation = (
    file: Express.Multer.File,
    options: PostImageDto,
): Promise<ImageManipulationDto> => {
    return new Promise(async (resolve, reject) => {
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
            fileBuffer: imageBuffer.data,
            originalImageInfo,
            manipulatedImageInfo: imageBuffer.info
        })
    });
}


export function isResizeEnabled(obj: GetImageQueryDto, val: boolean) {
    return obj.template !== null && obj.rsz;
}

export function isRotateEnabled(obj: GetImageQueryDto, val: boolean) {
    return obj.template !== null && obj.rtt != null;
}

export function isJpegEnabled(obj: GetImageQueryDto, val: boolean) {
    return obj.template !== null && obj.type == ImageType.jpeg;
}

export function isPngEnabled(obj: GetImageQueryDto, val: boolean) {
    return obj.template !== null && obj.type == ImageType.png;
}