import { TransformFnParams } from "class-transformer";
import { ObjectId } from "mongodb";


export const toObjectId = (v:TransformFnParams)=> {
    if (Array.isArray(v.value)) {
        const objectIds: ObjectId[] = [];
        v.value.forEach(val => {
            if (ObjectId.isValid(val)) {
                objectIds.push(new ObjectId(val));
            } else {
                objectIds.push(val);
            }
        });
        return objectIds;
    } else {
        if (ObjectId.isValid(v.value)) {
            return new ObjectId(v.value);
        } else {
            return v.value;
        }

    }
}
