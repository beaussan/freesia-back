import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { Authority } from './authorityes/authority.entity';
import { AuthorityService } from './authorityes/authority.service';
import { RolesGuard } from '../gard/roles.guard';
import { AuthObject } from './authorityes/authObject.entity';
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
