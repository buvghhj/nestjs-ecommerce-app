import { Inject, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {

    constructor(
        @Inject(UserRepository) private readonly userModel: UserRepository,
        private readonly userService: UsersService
    ) { }


    async use(req: Request | any, res: Response, next: NextFunction) {

        console.log('Middleware invoked for:', req.originalUrl)

        console.log('Cookies:', req.cookies)

        if (req.originalUrl.includes('/orders/webhook')) {

            return next()

        }

        try {

            const token = req.cookies.token

            if (!token) {

                throw new UnauthorizedException("Missing auth token")

            }

            const decodedData: any = await this.userService.decodedAuthToken(token)

            const user = await this.userModel.getUserDetailById(decodedData.id)

            if (!user) {

                throw new UnauthorizedException("Unauthorized")

            }

            user.password = undefined

            req.user = user

            next()

        } catch (error) {

            throw new UnauthorizedException(error.message)

        }

    }

}