import * as passport from 'passport';
import { MiddlewaresConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorsMiddleware } from '@nest-middlewares/cors';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

import { AppController } from './app.controller';

@Module({
    imports: [TypeOrmModule.forRoot(), UserModule, AuthModule],
    controllers: [AppController],
    components: [],
})
export class ApplicationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): void {
        consumer.apply(CorsMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
        consumer
            .apply(passport.authenticate('jwt', { session: false }))
            .forRoutes(
                { path: '/auth/authorized', method: RequestMethod.ALL },
                { path: '/auth/me', method: RequestMethod.ALL },
                { path: '/user', method: RequestMethod.GET },
                { path: '/user/:id', method: RequestMethod.ALL },
            );
    }
}
