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
import { AuthorityKey } from '../user/authorityes/authObject.entity';

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

    async findListById(
        id: number,
        user: User,
        access: AuthorityKey = READ,
    ): Promise<Optional<TodoList>> {
        user.canDoOnEntityOrThrows('TodoList', id, access);
        const list = await this.todoListRepository.findOne({ id });
        return Optional.ofNullable(list);
    }

    async findItemById(id: number): Promise<Optional<TodoItem>> {
        const list = await this.todoItemRepository.findOne({ id });
        return Optional.ofNullable(list);
    }

    async findItemByIdWithUserCheck(
        id: number,
        user: User,
        access: AuthorityKey,
    ): Promise<Optional<TodoItem>> {
        const todoItemWithList = await this.todoItemRepository
            .createQueryBuilder('todoItem')
            .innerJoin('todoItem.todoList', 'todoList')
            .where('todoItem.id = :id', { id: 1 })
            .getOne();

        return Optional.ofNullable(todoItemWithList).filter(todoItem =>
            user.canDoOnEntity('TodoList', todoItem.todoList.id, access),
        );
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
        const todo = (await this.findItemByIdWithUserCheck(itemId, user, EDIT)).orElseThrow(
            () => new NotFoundException(),
        );
        todo.isDone = !todo.isDone;
        return this.todoItemRepository.save(todo);
    }

    async togglePriorityTodo(user: User, itemId: number): Promise<TodoItem> {
        const todo = (await this.findItemByIdWithUserCheck(itemId, user, EDIT)).orElseThrow(
            () => new NotFoundException(),
        );
        todo.isHighPriority = !todo.isHighPriority;
        return this.todoItemRepository.save(todo);
    }

    async toggleArchiveTodo(user: User, itemId: number): Promise<TodoItem> {
        const todo = (await this.findItemByIdWithUserCheck(itemId, user, EDIT)).orElseThrow(
            () => new NotFoundException(),
        );
        todo.isArchived = !todo.isArchived;
        return this.todoItemRepository.save(todo);
    }

    async todoItemEditText(user: User, itemId: number, text: string): Promise<TodoItem> {
        const todo = (await this.findItemByIdWithUserCheck(itemId, user, EDIT)).orElseThrow(
            () => new NotFoundException(),
        );
        todo.text = text;
        return this.todoItemRepository.save(todo);
    }

    async todoListEditText(user: User, itemId: number, text: string): Promise<TodoList> {
        const todo = (await this.findListById(itemId, user, EDIT)).orElseThrow(
            () => new NotFoundException(),
        );
        todo.title = text;
        return this.todoListRepository.save(todo);
    }
}
