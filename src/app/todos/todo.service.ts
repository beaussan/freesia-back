import {
    Component,
    Inject,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import Optional from 'typescript-optional';

import { DELETE, EDIT, READ } from '../../auth/constant';
import { TodoItem } from './todoitem.entity';
import { TodoList } from './todolist.entity';
import { UserService } from '../user/user.service';

@Component()
export class TodoService {
    private readonly logger = new Logger('TodoService', true);

    constructor(
        private readonly userService: UserService,
        @InjectRepository(TodoItem) private readonly todoItemRepository: Repository<TodoItem>,
        @InjectRepository(TodoList) private readonly todoListRepository: Repository<TodoList>,
    ) {}

    async findAllListsForUser(user: User): Promise<TodoList[]> {
        const ids = user.getAllIdsWithPermition('TodoList', READ);
        return await this.todoListRepository.findByIds(ids);
    }

    async findListById(id: number, user: User): Promise<Optional<TodoList>> {
        user.canDoOnEntityOrThrows('TodoList', id, READ);
        const list = await this.todoListRepository.findOne({ id });
        return Optional.ofNullable(list);
    }

    async findItemById(id: number): Promise<Optional<TodoItem>> {
        const list = await this.todoItemRepository.findOne({ id });
        return Optional.ofNullable(list);
    }

    async createTodoList(user: User, name: string): Promise<TodoList> {
        const todoList = new TodoList();
        todoList.title = name;
        todoList.owner = user;
        const savedList = await this.todoListRepository.save(todoList);
        await this.userService.addAuthority('TodoList', savedList.id, user, [READ, EDIT, DELETE]);
        return savedList;
    }

    async addTodo(user: User, listId: number, message: string): Promise<TodoList> {
        user.canDoOnEntityOrThrows('TodoList', listId, EDIT);
        const todoItem = new TodoItem();
        todoItem.isArchived = false;
        todoItem.isDone = false;
        todoItem.isHighPriority = false;
        todoItem.text = message;
        todoItem.todoList = (await this.findListById(listId, user)).orElseThrow(
            () => new NotFoundException(),
        );
        await this.todoItemRepository.save(todoItem);

        return this.todoListRepository.findOneById(todoItem.todoList.id);
    }

    async toggleTodo(user: User, itemId: number): Promise<TodoItem> {
        const todo = (await this.findItemById(itemId)).orElseThrow(() => new NotFoundException());
        console.log(todo);

        return todo;
    }
}
