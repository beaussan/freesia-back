import {
    Guard,
    CanActivate,
    ExecutionContext,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import { Reflector } from '@nestjs/core';
import { UserService } from '../app/user/user.service';
import { plainToClass } from 'class-transformer';
import { User } from '../app/user/user.entity';

@Guard()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger('RolesGuard', true);

    constructor(private readonly reflector: Reflector, private readonly userService: UserService) {}

    async canActivate(req, context: ExecutionContext): Promise<boolean> {
        const { parent, handler } = context;
        const roles = this.reflector.get<string[]>('roles', handler);
        if (!roles) {
            this.logger.log('No roles found, continue');
            return true;
        }

        if (!req.user) {
            this.logger.log('No user found, stop');
            throw new UnauthorizedException();
        }
        const user: User = req.user.user;
        if (!user) {
            this.logger.log('No user id found, stop');
            this.logger.log(`${user}`);
            throw new UnauthorizedException();
        }

        this.logger.log(`going to fetch : ${user} ${user.id}`);

        const userDb = await this.userService.findById(user.id);

        this.logger.log('User from db : ' + userDb);

        const hasRole = () =>
            !!userDb
                .get()
                .authority.map(item => item.name)
                .find(role => !!roles.find(item => item === role));
        if (userDb.isPresent && hasRole()) {
            return true;
        }
        throw new UnauthorizedException();

        // return userDb.isPresent && hasRole();
    }
}
