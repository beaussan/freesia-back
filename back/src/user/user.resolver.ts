import { UserService } from './user.service';
import { Query, ResolveProperty, Resolver } from '@nestjs/graphql';
import { NotFoundException, Param, Req } from '@nestjs/common';
import { User } from './user.entity';
import { UserConnected } from '../decorator/user.decorator';
import { ROLE_ADMIN } from './authority.constants';

@Resolver('User')
export class UserResolver {
    constructor(private readonly userService: UserService) {}

    @Query('getUser')
    async findOne(obj, args, context, info, test): Promise<User> {
        const { id } = args;
        const { user } = obj.user;
        if (!user.authority.find(role => role.name === ROLE_ADMIN)) {
            user.canDoOnEntityOrThrows('User', id, 'READ');
        }
        const userDb = await this.userService.findById(id);
        return userDb.orElseThrow(() => new NotFoundException());
    }
}
