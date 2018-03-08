import { Middleware, NestMiddleware, ExpressMiddleware } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Middleware()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly authService: AuthService) {}

    resolve(...args: any[]): ExpressMiddleware {
        return async (req, res, next) => {
            const user = await this.authService.validateUserAndGet(req.auth.userId);
            req.context = {
                user,
            };
            req.user = {
                user,
            };
            next();
        };
    }
}
