import { toObjectId } from "@shared/transformer/to-objectId.transformer";
import { ObjectId } from "bson";
import { Transform } from "class-transformer";
import { IsDefined, IsMongoId } from "class-validator";

export class GetImageInfoDto {
    @IsDefined()
    @Transform(toObjectId)
    imageId: ObjectId;
}