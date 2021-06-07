import { ObjectId } from "bson";

export class ImageTemplate {
    _id: ObjectId;

    template: string;
}

export class ImageInfo {
    _id: ObjectId;
    colors: string[];
}