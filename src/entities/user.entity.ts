import { Exclude, Expose, Type } from "class-transformer";
import { ObjectId } from "mongodb";

export enum UserStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    COMPLETED = 'COMPLETED'
  }
  

export class UserSession {
    token: string;
    createdAt: Date;
}

@Exclude()
export class User {
    @Expose()
    @Type(() => String)
    _id: ObjectId;

    @Expose()
    firstName: string | null;

    @Expose()
    lastName: string | null;

    password: string | null;

    @Expose()
    phone: string;

    @Expose()
    email: string | null;

    @Expose()
    status: UserStatus;

    @Expose()
    createAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose({ groups: ['session'] })
    sessions: UserSession[];

    constructor(data: Omit<User, '_id'>) {
        return Object.assign(this, data);
    }
}