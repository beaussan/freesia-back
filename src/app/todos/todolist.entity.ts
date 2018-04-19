import { DbAuditModel } from '../../util/dbmodel.model';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { TodoItem } from './todoitem.entity';

@Entity()
export class TodoList extends DbAuditModel {
    @Column({ length: 500 })
    title: string;

    @ManyToOne(type => User, user => user.todoLists)
    owner: User;

    @OneToMany(type => TodoItem, item => item.todoList, { eager: true })
    todoItems: TodoItem[];
}
