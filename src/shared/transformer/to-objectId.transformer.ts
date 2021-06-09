import { HttpError } from "@shared/helper/http-error.helper";
import { TransformFnParams } from "class-transformer";
import { ObjectId } from "mongodb";


export const toObjectId = (v: TransformFnParams) => {
    if (Array.isArray(v.value)) {
        const objectIds: ObjectId[] = [];
        v.value.forEach(val => {
            if (ObjectId.isValid(val)) {
                objectIds.push(new ObjectId(val));
            } else {
                throw new HttpError({ status: 400, message: "id must be a valid mongo id" });
            }
        });
        return objectIds;
    } else {
        if (ObjectId.isValid(v.value)) {
            return new ObjectId(v.value);
        } else {
            throw new HttpError({ status: 400, message: "id must be a valid mongo id" });
        }

    }
}

