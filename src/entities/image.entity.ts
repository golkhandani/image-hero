import { ObjectId } from "bson";

export class ImageTemplate {
    _id: ObjectId;

    template: string;
}

export class ImageInfo {
    _id: ObjectId;
    colors: string[];
    fileAddress: string;
    filePath: string;
    fileBucket: string;
    fileFolder: string;
}

export class ImageCache {
    _id: ObjectId;
    requestUrl: string;
    cacheOptions: string;
    cacheUrl: string;
    lastGetAt: Date;
}