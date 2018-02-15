import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Authority } from './authority.entity';
import { AuthorityService } from './authority.service';
import { RolesGuard } from '../gard/roles.guard';
import { AuthObject } from './authObject.entity';
import { UserResolver } from './user.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Authority, AuthObject]),
        forwardRef(() => AuthModule),
    ],
    controllers: [UserController],
    components: [UserService, AuthorityService, RolesGuard, UserResolver],
    exports: [UserService],
})
export class UserModule {}
