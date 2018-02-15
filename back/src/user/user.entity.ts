import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinTable,
    ManyToMany,
    JoinColumn,
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn,
    VersionColumn,
    OneToMany,
} from 'typeorm';
import { Authority } from './authority/authority.entity';
import { Exclude, Type } from 'class-transformer';
import { DbAuditModel } from '../util/dbmodel.model';
import { AuthObject, AuthorityKey, Resource } from './authority/authObject.entity';
import { UnauthorizedException } from '@nestjs/common';

@Entity()
export class User extends DbAuditModel {
    @Column({ length: 500 })
    firstName: string;

    @Column({ length: 500 })
    lastName: string;

    @Column()
    @Exclude()
    password: string;

    @Column({ unique: true })
    email: string;

    @ManyToMany(type => Authority, authority => authority.users, {
        eager: true,
    })
    @JoinTable()
    @Type(() => Authority)
    authority: Authority[];

    @OneToMany(type => AuthObject, object => object.owner, {
        cascadeUpdate: true,
        eager: true,
        cascadeInsert: true,
    })
    authObjects: AuthObject[];

    public canDoOnEntity(entityType: Resource, idRessource: number, access: AuthorityKey): boolean {
        return (
            this.authObjects.filter(
                value =>
                    value.resource === entityType &&
                    `${value.resourceId}` === `${idRessource}` &&
                    value.authorities.indexOf(access) !== -1,
            ).length > 0
        );
    }

    public canDoOnEntityOrThrows(entityType: Resource, id: number, access: AuthorityKey) {
        if (this.canDoOnEntity(entityType, id, access)) {
            return true;
        }
        throw new UnauthorizedException('Not enough permission');
    }
}
