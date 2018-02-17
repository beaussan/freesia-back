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
import { TokenAuth } from './authorityes/token.entity';
import { TokenService } from './authorityes/token.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Authority, AuthObject, TokenAuth]),
        forwardRef(() => AuthModule),
    ],
    controllers: [],
    components: [UserService, AuthorityService, RolesGuard, UserResolver, TokenService],
    exports: [UserService, TokenService],
})
export class UserModule {}
