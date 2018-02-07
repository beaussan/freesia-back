import { User } from './user.entity';
import { DbAuditModel } from '../util/dbmodel.model';
import { Column, Entity, ManyToOne } from 'typeorm';

export type Resource = 'User';
export type AuthorityKey = 'CREATE' | 'DELETE' | 'EDIT' | 'READ';

@Entity()
export class AuthObject extends DbAuditModel {
    constructor(resource: Resource, resourceId: number, authorities: AuthorityKey[], owner: User) {
        super();
        this.resource = resource;
        this.resourceId = resourceId;
        this.authorities = authorities;
        this.owner = owner;
    }

    @Column('varchar') resource: Resource;

    @Column() resourceId: number;

    @Column({ type: 'varchar', isArray: true })
    authorities: AuthorityKey[];

    @ManyToOne(type => User, user => user.authObjects)
    owner: User;
}
