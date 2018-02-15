import { Entity, Column, ManyToMany } from 'typeorm';
import { User } from '../user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Authority {
    constructor(name: string) {
        this.name = name;
    }

    @Column({ length: 200, primary: true })
    name: string;

    @Exclude()
    @ManyToMany(type => User, user => user.authority)
    users: User[];
}
