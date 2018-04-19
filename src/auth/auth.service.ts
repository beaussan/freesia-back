import * as jwt from 'jsonwebtoken';
import { Component, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { generate } from 'rand-token';
import { User } from '../app/user/user.entity';
import { SECRET_KEY, EXPIRE_TOKEN } from './constant';
import { UserService } from '../app/user/user.service';
import { TokenAuth } from '../app/user/authorityes/token.entity';
import { TokenService } from '../app/user/authorityes/token.service';

@Component()
export class AuthService {
    private readonly logger = new Logger('AuthService', true);

    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
    ) {}

    async createToken(user: User) {
        const userInToken = { userId: user.id };
        const token = jwt.sign(userInToken, SECRET_KEY, { expiresIn: EXPIRE_TOKEN });
        const refreshToken = await this.generateRefreshToken(user);
        return {
            user,
            expires_in: EXPIRE_TOKEN,
            access_token: token,
            refresh_token: refreshToken.token,
        };
    }

    async createTokenFromRefreshToken(refreshToken: string) {
        return (await this.tokenService.findByToken(refreshToken))
            .map(async token => {
                const userInToken = { userId: token.owner.id };
                const jwtToken = jwt.sign(userInToken, SECRET_KEY, { expiresIn: EXPIRE_TOKEN });
                token.setNewDate();
                await this.tokenService.save(token);
                return {
                    expires_in: EXPIRE_TOKEN,
                    access_token: jwtToken,
                    refresh_token: token.token,
                };
            })
            .orElseThrow(() => new UnauthorizedException());
    }

    private async generateRefreshToken(user: User): Promise<TokenAuth> {
        const tokenString = user.id.toString() + '.' + generate(64);
        const token = new TokenAuth(tokenString, user);

        return this.tokenService.save(token);
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
