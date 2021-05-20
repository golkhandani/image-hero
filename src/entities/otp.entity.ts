import { Exclude, Expose, Type } from "class-transformer";
import { ObjectId } from "mongodb";

@Exclude()
export class OTP {
    @Expose()
    @Type(() => String)
    _id: ObjectId;

    @Expose() // ! should be removed
    code: string;

    phone: string;

    @Expose()
    createdAt: Date;

    @Expose()
    expireAt: Date;

    constructor(data: Omit<OTP, '_id'>) {
        if (data) {
            return Object.assign(this, data);
        }
    }
}
