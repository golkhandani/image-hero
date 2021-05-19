import { MongoConnection } from "@shared/database";
import { plainToClass } from "class-transformer";
import { Length, validate, validateOrReject } from "class-validator";
import { Collection, ObjectId } from "mongodb";
import { PhoneVerificationDto } from "src/routes/auth";

export enum UserStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
}

export interface IHttpError {
    status: number;
    message: string;
}
export class HttpError extends Error {
    public status: number;
    public message: string;
    constructor({status, message}:IHttpError){
        super()
        this.message = message;
        this.status = status;
    }
}

export class User {
    _id: ObjectId;

    firstName: string | null;

    lastName: string | null;

    password: string | null;

    phone: string;

    email: string | null;

    status: UserStatus;

    createAt: Date;

    updatedAt: Date;

    constructor(data: Omit<User, '_id'>) {
        return Object.assign(this,data);
    }
}


export class AuthService {

    
    constructor(
        private readonly userCollection: Collection<User>
    ) { }

    async authPhoneVerification(phoneVerificationDto: PhoneVerificationDto) {
        const exists = await this.userCollection.findOne({phone: phoneVerificationDto.phone});
        if(exists) {
            throw new HttpError({message: "User Already Exists!", status: 400})
        } 

        const newUser = new User({
            email: null,
            phone: phoneVerificationDto.phone,
            password: null,
            firstName: null,
            lastName: null,
            status: UserStatus.PENDING,
            createAt: new Date(),
            updatedAt: new Date()
        });
        const createdUser = (await this.userCollection.insertOne(newUser)).ops[0];
        return createdUser;
    }

    async authPhoneVerificationCode() {
        
        
    }

    

    authRegisterUserInfo() {

    }
    async authLogin() {
    }
}