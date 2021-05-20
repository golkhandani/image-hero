import { OTP } from '@entities/otp.entity';
import { User, UserSession, UserStatus } from '@entities/user.entity';
import { HttpError } from '@shared/http-error.helper';
import { ZibalPayment } from '@shared/zibal.helper';
import { plainToClass } from 'class-transformer';
import moment from 'moment';
import { Collection, ObjectId } from 'mongodb';
import { LoginDto, PhoneVerificationCodeDto, PhoneVerificationDto, RegisterUserInfoDto } from 'src/dtos/user.dto';


export class UserService {


    constructor(
        private readonly userCollection: Collection<User>,
        private readonly otpCollection: Collection<OTP>,
    ) { }

    private generateRandomCode(): string {
        return Math.floor((Math.random() * 1000) + 1000).toString();
    }


    public async authPhoneVerification(phoneVerificationDto: PhoneVerificationDto): Promise<OTP> {
        const existsUser = await this.userCollection.findOne({ phone: phoneVerificationDto.phone });
        if (existsUser) {
            throw new HttpError({ message: "User Already Exists!", status: 400 })
        }

        const newOtp = new OTP({
            code: this.generateRandomCode(),
            createdAt: moment().toDate(),
            expireAt: moment().add(5, "minutes").toDate(),
            phone: phoneVerificationDto.phone,
        })

        const createdOtp = (await this.otpCollection.insertOne(newOtp)).ops[0];
        return plainToClass(OTP, createdOtp);
    }


    public async authPhoneVerificationCode(phoneVerificationCodeDto: PhoneVerificationCodeDto) {
        const otp = await this.otpCollection.findOne({
            _id: phoneVerificationCodeDto.phoneVerificationId
        });

        if (!otp) {
            throw new HttpError({ message: "You don't have code yet", status: 400 });
        } else if (otp && moment(otp.expireAt).isBefore(new Date())) {
            throw new HttpError({ message: "Your code has been expired. Try again", status: 400 });
        } else if (otp && otp.code !== phoneVerificationCodeDto.code) {
            throw new HttpError({ message: "Your code does not match. Try again", status: 400 });
        }

        // update and add session to user
        // return session and user info
        await this.otpCollection.findOneAndDelete({ _id: otp._id });
        
        const session: UserSession = {
            token: (new ObjectId()).toHexString(),
            createdAt: moment().toDate(),
        };
        const newUser = new User({
            email: null,
            phone: otp.phone,
            password: null,
            firstName: null,
            lastName: null,
            status: UserStatus.VERIFIED,
            createAt: moment().toDate(),
            updatedAt: moment().toDate(),
            sessions: [session],
        });

        const createdUser = (await this.userCollection.insertOne(newUser)).ops[0];
        
        return plainToClass(User, createdUser, { groups: ['session'] });
    }


    public async authPhoneVerificationCodeResend(phoneVerificationDto: PhoneVerificationDto) {
        const otp = await this.otpCollection.findOne({
            phone: phoneVerificationDto.phone
        });

        if (!otp) {
            throw new HttpError({ message: "You does not registered your phone. Please sign up", status: 400 });
        } else if (otp && moment(otp.expireAt).isAfter(new Date())) {
            return plainToClass(OTP, otp);
        }
        otp.code = this.generateRandomCode();
        otp.createdAt = moment().toDate();
        otp.expireAt = moment().add(5, "minutes").toDate();
        const updatedOtp = (await this.otpCollection.findOneAndReplace({ _id: otp._id }, otp, { returnOriginal: false })).value;

        return plainToClass(OTP, updatedOtp);
    }


    public async authRegisterUserInfo(existsUser: User, registerUserInfoDto: RegisterUserInfoDto) {
       
        existsUser.firstName = registerUserInfoDto.firstName;
        existsUser.lastName = registerUserInfoDto.lastName;
        existsUser.email = registerUserInfoDto.email;
        existsUser.password = registerUserInfoDto.password;
        existsUser.status = UserStatus.COMPLETED;
        existsUser.updatedAt = moment().toDate();

        const updatedUser = (await this.userCollection.findOneAndReplace({_id: existsUser._id},existsUser, {returnOriginal: false})).value;
        return plainToClass(User, updatedUser);
    }


    public async authLogin(loginDto: LoginDto) {
        const existsUser = await this.userCollection.findOne({ phone: loginDto.phone });
        if (!existsUser) {
            throw new HttpError({ message: "user does not exists!", status: 400 });
        } else if(existsUser && existsUser.password !== loginDto.password) {
            throw new HttpError({ message: "user does not exists!", status: 400 });
        }

        const session: UserSession = {
            token: (new ObjectId()).toHexString(),
            createdAt: moment().toDate(),
        };
        existsUser.sessions.push(session);
        const updatedUser = (await this.userCollection.findOneAndReplace({ _id: existsUser._id }, existsUser, { returnOriginal: false })).value;
        
        updatedUser!.sessions = [session];
        return plainToClass(User, updatedUser, { groups: ['session'] });
    }
}