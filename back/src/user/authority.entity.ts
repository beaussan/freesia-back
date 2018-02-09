import { Entity, Column, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity()
export class Authority {
    constructor(name: string) {
        this.name = name;
    }

    @ApiModelProperty()
    @Column({ length: 200, primary: true })
    name: string;

    @Exclude()
    @ManyToMany(type => User, user => user.authority)
    users: User[];
}
