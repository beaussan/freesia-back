import { User } from '../user.entity';
import { DbAuditModel } from '../../util/dbmodel.model';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';

const DAY_INACTIVITY = 15;

@Entity()
export class TokenAuth extends DbAuditModel {
    constructor(token: string, owner: User) {
        super();
        this.token = token;
        this.owner = owner;
        this.lastUse = new Date();
    }

    @Column() token: string;

    @Column('timestamp') lastUse: Date;

    @Exclude()
    @ManyToOne(type => User, user => user.tokens)
    owner: User;

    public setNewDate(): void {
        this.lastUse = new Date();
    }

    public hasToBeRemoved(): boolean {
        const myDate = this.lastUse;
        myDate.setDate(myDate.getDate() + DAY_INACTIVITY);

        return myDate < new Date();
    }
}
