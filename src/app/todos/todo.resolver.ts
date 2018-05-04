import { NotFoundException, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../gard/roles.guard';
import { Mutation, Resolver, Query } from '@nestjs/graphql';
import { TodoService } from './todo.service';
import { ROLE_USER } from '../user/authorityes/authority.constants';
import { Roles } from '../../decorator/roles.decorator';
import { TodoList } from './todolist.entity';
import { TodoItem } from './todoitem.entity';
import Optional from 'typescript-optional';

@UseGuards(RolesGuard)
@Resolver('Todo')
export class TodoResolver {
    constructor(private readonly todoService: TodoService) {}

    @Roles(ROLE_USER)
    @Query()
    async allTodoList(obj, options, { user }, info): Promise<TodoList[]> {
        const list = await this.todoService.findAllListsForUser(user);
        return Optional.ofNullable(list)
            .map(l => this.todoService.filterArchivedList(l))
            .get();
    }

    @Roles(ROLE_USER)
    @Query()
    async todoListById(obj, { id }, { user }, info): Promise<TodoList> {
        return (await this.todoService.findListById(id, user))
            .map(list => this.todoService.filterArchived(list))
            .orElseThrow(() => new NotFoundException());
    }

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
    @Mutation()
    async toggleTodo(obj, { itemId }, { user }, info): Promise<TodoItem> {
        return this.todoService.toggleTodo(user, itemId);
    }

    @Roles(ROLE_USER)
    @Mutation()
    async toggleTodoPriority(obj, { itemId }, { user }, info): Promise<TodoItem> {
        return this.todoService.togglePriorityTodo(user, itemId);
    }

    @Roles(ROLE_USER)
    @Mutation()
    async archiveTodo(obj, { itemId }, { user }, info): Promise<TodoItem> {
        return this.todoService.toggleArchiveTodo(user, itemId);
    }

    @Roles(ROLE_USER)
    @Mutation()
    async editTodoItemText(obj, { itemId, text }, { user }, info): Promise<TodoItem> {
        return this.todoService.todoItemEditText(user, itemId, text);
    }

    @Roles(ROLE_USER)
    @Mutation()
    async editTodoListText(obj, { itemId, text }, { user }, info): Promise<TodoList> {
        return this.todoService.todoListEditText(user, itemId, text);
    }

    @Roles(ROLE_USER)
    @Mutation()
    async editTodoListName(obj, { itemId, text }, { user }, info): Promise<TodoList> {
        return this.todoService.todoListEditText(user, itemId, text);
    }

    @Roles(ROLE_USER)
    @Mutation()
    async editTodoItemName(obj, { itemId, text }, { user }, info): Promise<TodoItem> {
        return this.todoService.todoItemEditText(user, itemId, text);
    }
}
