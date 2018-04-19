import { Column, Entity, ManyToOne } from 'typeorm';
import { DbAuditModel } from '../../util/dbmodel.model';
import { TodoList } from './todolist.entity';

@Entity()
export class TodoItem extends DbAuditModel {
    @Column({ length: 500 })
    text: string;

    @Column() isDone: boolean;

    @Column() isArchived: boolean;

    @Column() isHighPriority: boolean;

    @ManyToOne(type => TodoList, user => user.todoItems)
    todoList: TodoList;
}
