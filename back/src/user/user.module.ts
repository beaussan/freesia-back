import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Authority } from './authority.entity';
import { AuthorityService } from './authority.service';
import { RolesGuard } from '../gard/roles.guard';
import { AuthObject } from './authObject.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Authority, AuthObject])],
    controllers: [UserController],
    components: [UserService, AuthorityService, RolesGuard],
    exports: [UserService],
})
export class UserModule {}
