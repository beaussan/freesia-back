import * as jwt from 'jsonwebtoken';
import { Component, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.entity';
import { SECRET_KEY } from './constant';
import { UserService } from '../user/user.service';

@Component()
export class AuthService {
    private readonly logger = new Logger('AuthService', true);

    constructor(private readonly userService: UserService) {}

    async createToken(user: User) {
        const expiresIn = 60 * 60 * 24 * 200,
            secretOrKey = SECRET_KEY;
        const userInToken = { userId: user.id };
        const token = jwt.sign(userInToken, secretOrKey, { expiresIn });
        return {
            expires_in: expiresIn,
            access_token: token,
        };
    }

    async validateUser(signedUser): Promise<boolean> {
        this.logger.log(`Signed user : ${JSON.stringify(signedUser)}`);
        signedUser.user = (await this.userService.findById(signedUser.userId)).orElseThrow(
            () => new UnauthorizedException(),
        );
        return true;
    }

    async validateUserAndGet(id: number): Promise<User | undefined> {
        this.logger.log(`Signed user : ${JSON.stringify(id)}`);
        return (await this.userService.findById(id)).get();
    }
}
