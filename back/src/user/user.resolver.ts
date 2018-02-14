import { UserService } from './user.service';
import { Mutation, Query, ResolveProperty, Resolver } from '@nestjs/graphql';
import {
    ConflictException,
    NotFoundException,
    Param,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserConnected } from '../decorator/user.decorator';
import { ROLE_ADMIN, ROLE_USER } from './authority.constants';
import { Roles } from '../decorator/roles.decorator';
import { RolesGuard } from '../gard/roles.guard';
import { AuthService } from '../auth/auth.service';

@UseGuards(RolesGuard)
@Resolver('User')
export class UserResolver {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) {}

    @Roles(ROLE_USER)
    @Query('getAllUser')
    async getAllUser(obj, args, { user }, info): Promise<User[]> {
        if(user.authority.find(role => role.name === ROLE_ADMIN)) {
            return await this.userService.findAll();
        }
        const users = await this.userService.findAll();
        return users.filter(usr => user.canDoOnEntity('User', usr.id, 'READ'));
    }

    @Roles(ROLE_USER)
    @Query('getUser')
    async findOne(obj, { id }, { user }, info): Promise<User> {
        // const { user } = obj.user;
        if (!user.authority.find(role => role.name === ROLE_ADMIN)) {
            user.canDoOnEntityOrThrows('User', id, 'READ');
        }
        const userDb = await this.userService.findById(id);
        return userDb.orElseThrow(() => new NotFoundException());
    }

    @Roles(ROLE_USER)
    @Query('getMe')
    async findMe(obj, args, { user }, info): Promise<User> {
        const userDb = await this.userService.findById(+user.id);
        return userDb.orElseThrow(() => new NotFoundException());
    }

    @Query('getToken')
    async getToken(obj, { email, password }, context, info): Promise<any> {
        const maybeUser = await this.userService.findByEmail(email);
        if (!maybeUser.isPresent) {
            throw new NotFoundException();
        }
        const user = maybeUser.get();
        if (this.userService.doPasswordMatch(password, user)) {
            return await this.authService.createToken(user);
        }
        throw new UnauthorizedException();
    }

    @Mutation('register')
    async registerUser(obj, { newUser }, context, info): Promise<User> {
        const maybeUser = await this.userService.findByEmail(newUser.email.toLocaleLowerCase());
        if (maybeUser.isPresent) {
            throw new ConflictException('Email already taken');
        }
        return await this.userService.saveDto(newUser);
    }
}
