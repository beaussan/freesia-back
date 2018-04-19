import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserService } from './user/user.service';
import { Authority } from './user/authorityes/authority.entity';
import { AuthorityService } from './user/authorityes/authority.service';
import { RolesGuard } from '../gard/roles.guard';
import { AuthObject } from './user/authorityes/authObject.entity';
import { UserResolver } from './user/user.resolver';
import { AuthModule } from '../auth/auth.module';
import { TokenAuth } from './user/authorityes/token.entity';
import { TokenService } from './user/authorityes/token.service';
import { TodoItem } from './todos/todoitem.entity';
import { TodoList } from './todos/todolist.entity';
import { TodoService } from './todos/todo.service';
import { TodoResolver } from './todos/todo.resolver';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Authority, AuthObject, TokenAuth, TodoItem, TodoList]),
        forwardRef(() => AuthModule),
    ],
    controllers: [],
    components: [
        // Users
        UserService,
        AuthorityService,
        UserResolver,
        TokenService,
        RolesGuard,

        // Todos
        TodoService,
        TodoResolver,
    ],
    exports: [UserService, TokenService, RolesGuard],
})
export class AppModule {}
