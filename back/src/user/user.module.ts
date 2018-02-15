import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { Authority } from './authority/authority.entity';
import { AuthorityService } from './authority/authority.service';
import { RolesGuard } from '../gard/roles.guard';
import { AuthObject } from './authority/authObject.entity';
import { UserResolver } from './user.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Authority, AuthObject]),
        forwardRef(() => AuthModule),
    ],
    controllers: [],
    components: [UserService, AuthorityService, RolesGuard, UserResolver],
    exports: [UserService],
})
export class UserModule {}
