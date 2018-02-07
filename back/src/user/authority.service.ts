import { Component, Inject, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Authority } from './authority.entity';
import { ROLE_ADMIN, ROLE_USER } from './authority.constants';

@Component()
export class AuthorityService {
    public roleUser: Authority;
    public roleAdmin: Authority;
    public roleWorker: Authority;
    public roleBusiness: Authority;

    private readonly logger = new Logger('AuthorityService', true);

    constructor(
        @InjectRepository(Authority) private readonly authorityRepository: Repository<Authority>,
    ) {
        this.loadAuthority();
    }

    private saveAuth(value: Authority): void {
        switch (value.name) {
            case ROLE_USER:
                this.roleUser = value;
                break;
            case ROLE_ADMIN:
                this.roleAdmin = value;
                break;
        }
    }

    private async loadAuthority(): Promise<void> {
        const autho = await this.authorityRepository.find();
        if (autho.length === 4) {
            this.logger.log('loading all authority from db');
            for (const value of autho) {
                this.saveAuth(value);
            }
        } else {
            for (const name of [ROLE_USER, ROLE_ADMIN]) {
                try {
                    this.logger.log(`create authority ${name} in db`);
                    const ret = await this.authorityRepository.save(new Authority(name));
                    this.saveAuth(ret);
                } catch (e) {
                    this.logger.log(`the authority ${name} was already in db`);
                    const ret = await this.authorityRepository.findOne({ name });
                    this.saveAuth(ret);
                }
            }
        }
    }
}
