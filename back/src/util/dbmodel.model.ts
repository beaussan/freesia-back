import { ApiModelProperty } from '@nestjs/swagger';
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export abstract class DbAuditModel {
    @ApiModelProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    @Exclude()
    creationDate: Date;

    @UpdateDateColumn()
    @Exclude()
    updateDate: Date;

    @VersionColumn()
    @Exclude()
    version: number;
}
