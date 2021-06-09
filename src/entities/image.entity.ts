import { ObjectId } from "bson";
import sharp from "sharp";



export const formats = ["jpeg", "png", "webp"] as const;
export type Format = typeof formats[never];

export const spaces = ["srgb", "rgb", "cmyk", "lab", "b-w"] as const;
export type Space = typeof spaces[never];






export class ImageTemplate {
    _id: ObjectId;

    template: string;
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