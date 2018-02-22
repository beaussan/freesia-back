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
import { Authority } from './authorityes/authority.entity';
import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { DbAuditModel } from '../util/dbmodel.model';
import { AuthObject, AuthorityKey, Resource } from './authorityes/authObject.entity';
import { UnauthorizedException } from '@nestjs/common';
import { TokenAuth } from './authorityes/token.entity';

@Entity()
export class User extends DbAuditModel {
    @ApiModelProperty({ required: true })
    @Column({ length: 500 })
    firstName: string;

    @ApiModelProperty({ required: true })
    @Column({ length: 500 })
    lastName: string;

    @Column()
    @Exclude()
    password: string;

    @ApiModelProperty({ required: true })
    @Column({ unique: true })
    email: string;

    @ManyToMany(type => Authority, authority => authority.users, {
        eager: true,
    })
    @ApiModelProperty({ isArray: true, type: Authority })
    @JoinTable()
    @Type(() => Authority)
    authority: Authority[];

    @OneToMany(type => AuthObject, object => object.owner, {
        cascadeUpdate: true,
        eager: true,
        cascadeInsert: true,
    })
    authObjects: AuthObject[];

    @OneToMany(type => TokenAuth, object => object.owner, {
        cascadeUpdate: true,
        cascadeInsert: true,
    })
    tokens: TokenAuth[];

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
