import { UserService } from './user.service';
import { Mutation, Query, ResolveProperty, Resolver } from '@nestjs/graphql';
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
    Param,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserConnected } from '../../decorator/user.decorator';
import { ROLE_ADMIN, ROLE_USER } from './authorityes/authority.constants';
import { Roles } from '../../decorator/roles.decorator';
import { RolesGuard } from '../../gard/roles.guard';
import { AuthService } from '../../auth/auth.service';
import { UserRegisterDto } from './dto/user.register.dto';
import { plainToClass } from 'class-transformer';
import { validate, Validator } from 'class-validator';

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
        if (user.authority.find(role => role.name === ROLE_ADMIN)) {
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

    @Mutation('getToken')
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

    @Mutation('refreshToken')
    async refreshToken(obj, { token }, context, info): Promise<any> {
        return this.authService.createTokenFromRefreshToken(token);
    }

    @Mutation('register')
    async registerUser(obj, { newUser }, context, info): Promise<User> {
        const entityTab = plainToClass(UserRegisterDto, newUser);
        const errors = await validate(entityTab);
        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        const maybeUser = await this.userService.findByEmail(newUser.email.toLocaleLowerCase());
        if (maybeUser.isPresent) {
            throw new ConflictException('Email already taken');
        }
        return await this.userService.saveDto(newUser);
    }

    @Roles(ROLE_USER)
    @Mutation('updateEmail')
    async updateEmail(obj, { password, email }, { user }, info): Promise<User> {
        const validator = new Validator();
        if (validator.isEmpty(email) || !validator.isEmail(email)) {
            throw new BadRequestException('email not valid');
        }
        return this.userService.editUserEmail(email, user, password);
    }

    @Roles(ROLE_USER)
    @Mutation('updateUserInfo')
    async updateUserInfo(obj, { firstname, lastname }, { user }, info): Promise<User> {
        return this.userService.updateUserInfo(user, firstname, lastname);
    }

    @Roles(ROLE_USER)
    @Mutation('updatePassword')
    async updatePassword(obj, { oldPassword, newPassword }, { user }, info): Promise<User> {
        const validator = new Validator();
        if (!validator.minLength(newPassword, 6)) {
            throw new BadRequestException('new password too short');
        }
        return this.userService.editUserPassword(newPassword, oldPassword, user);
    }
}
