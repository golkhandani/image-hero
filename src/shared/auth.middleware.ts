import { TokenDto } from '@dtos/user.dto';
import { User } from '@entities/user.entity';
import { Request } from 'express';
import moment from 'moment';
import { Db } from 'mongodb';

import { catchError } from './catch-error.interceptor';
import { HttpError } from './http-error.helper';
import { validateAndTransformRequest } from './validate-transform.helper';

export type RequestWithUser = Request<Record<string, any>> & { user: User }

export async function authMiddleware(req: any, res: any, next: any) {
    try {
        const token = (await validateAndTransformRequest(req.headers, TokenDto)).token;
        const userCollection = (req.app.get('mongo') as Db).collection<User>(User.name);
        const user = await userCollection.findOne(
            {
                "sessions.token": token
            },
            {
                projection: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,

                    phone: 1,
                    email: 1,

                    password: 1,
                    status: 1,

                    createAt: 1,
                    updatedAt: 1,
                    
                    sessions: { $elemMatch: { token: token } },
                }
            }
        );
        console.log(user);
        
        if (!user) {
            throw new HttpError({ message: "Unauthorized", status: 401 })
        } else if (user && user.sessions[0] &&
            moment(user.sessions[0].createdAt).isAfter(
                moment(user.sessions[0].createdAt).add(1, "hours")
            )
        ) {
            await userCollection.findOneAndUpdate({ _id: user._id }, {
                $pull: { sessions: { createdAt: user.sessions[0].createdAt } }
            })
            throw new HttpError({ message: "Unauthorized", status: 401 })

        } else {
            req.user = user;
            return next();
        }
    } catch (error) {
        catchError(error, res);
    }


}

