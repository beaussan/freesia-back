import { UseGuards} from '@nestjs/common';
import { RolesGuard } from '../../gard/roles.guard';
import { Mutation, Resolver, Query } from '@nestjs/graphql';
import { TodoService } from './todo.service';
import { ROLE_USER } from '../user/authorityes/authority.constants';
import { Roles } from '../../decorator/roles.decorator';
import { TodoList } from './todolist.entity';

@UseGuards(RolesGuard)
@Resolver('Todo')
export class TodoResolver {
    constructor(private readonly todoService: TodoService) {}

    @Roles(ROLE_USER)
    @Mutation()
    async createTodoList(obj, { name }, { user }, info): Promise<TodoList> {
        return this.todoService.createTodoList(user, name);
    }

    @Roles(ROLE_USER)
    @Mutation()
    async addTodoItem(obj, { listId, message }, { user }, info): Promise<TodoList> {
        return this.todoService.addTodo(user, listId, message);
    }

    @Roles(ROLE_USER)
    @Query('allTodoList')
    async allTodoList(obj, options, { user }, info): Promise<TodoList[]> {
        return this.todoService.findAllListsForUser(user);
    }
}
