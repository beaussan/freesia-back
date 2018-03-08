import { Component, Inject, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as cron from 'node-cron';
import Optional from 'typescript-optional';
import { TokenAuth } from './token.entity';

@Component()
export class TokenService {
    private readonly logger = new Logger('TokenService', true);

    constructor(
        @InjectRepository(TokenAuth) private readonly tokenAuthRepository: Repository<TokenAuth>,
    ) {
        this.removeOldTokens();
        cron.schedule('* */10 * * * *', this.removeOldTokens.bind(this));
    }

    public save(token: TokenAuth): Promise<TokenAuth> {
        return this.tokenAuthRepository.save(token);
    }

    async findByToken(token: string): Promise<Optional<TokenAuth>> {
        const tokenAuth = await this.tokenAuthRepository.findOne({
            where: { token },
            relations: ['owner'],
        });
        return Optional.ofNullable(tokenAuth);
    }

    private removeOldTokens() {
        this.logger.log('removing old refresh tokens');
        this.tokenAuthRepository
            .createQueryBuilder('token')
            .delete()
            .where('"lastUse" < NOW() - INTERVAL \'15 days\'')
            .execute();
    }
}
