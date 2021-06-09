import sharp from "sharp";

export class ImageManipulationDto {
    fileBuffer?: Buffer;
    originalImageInfo: sharp.Metadata
    manipulatedImageInfo: sharp.OutputInfo
}