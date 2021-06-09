import { Format, Space } from "@entities/image.entity";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ImageMetadataDto {
    @Expose()
    format: Format; // Name of decoder used to decompress image data
    @Expose()
    size: number; // size of image in byte
    @Expose()
    width: number;
    @Expose()
    height: number;
    @Expose()
    space?: Space; // Name of colour space interpretation
    @Expose()
    channels: 3 | 4;
    @Expose()
    density: number; // Number of bands e.g. 3 for sRGB, 4 for CMYK
    @Expose()
    isProgressive: boolean; // Indicating whether the image is interlaced using a progressive scan
    @Expose()
    pages: number;
    @Expose()
    orientation: number;
}
