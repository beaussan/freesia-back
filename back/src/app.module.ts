import * as passport from 'passport';
import { MiddlewaresConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorsMiddleware } from '@nest-middlewares/cors';

import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { GraphQLModule, GraphQLFactory } from '@nestjs/graphql';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

import { AppController } from './app.controller';

@Module({
    imports: [TypeOrmModule.forRoot(), GraphQLModule, UserModule, AuthModule],
    controllers: [AppController],
    components: [],
})
export class ApplicationModule implements NestModule {
    constructor(private readonly graphQLFactory: GraphQLFactory) {}

    configure(consumer: MiddlewaresConsumer): void {
        // Auth routes
        consumer
            .apply(passport.authenticate('jwt', { session: false }))
            .forRoutes(
                { path: '/auth/authorized', method: RequestMethod.ALL },
                { path: '/auth/me', method: RequestMethod.ALL },
                { path: '/graphql', method: RequestMethod.ALL },
                { path: '/user', method: RequestMethod.GET },
                { path: '/user/:id', method: RequestMethod.ALL },
            );

        // Graphql
        const typeDefs = this.graphQLFactory.mergeTypesByPaths('./**/*.graphql');
        const schema = this.graphQLFactory.createSchema({ typeDefs });

        const devToken =
            'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImlhdCI6MTUxODA0MDY2MywiZXhwIjoxNTM1MzIwNjYzfQ.HmiU_seCSb4_b5nzCMkab4XDyFM_v6fSN9JMqvm7lhU';

        consumer
            .apply(
                graphiqlExpress({
                    endpointURL: '/graphql',
                    passHeader: `"Authorization": "${devToken}"`,
                }),
            )
            .forRoutes({ path: '/graphiql', method: RequestMethod.GET })
            .apply(graphqlExpress(req => ({ schema, rootValue: req })))
            .forRoutes({ path: '/graphql', method: RequestMethod.ALL });

        // Cros middleware
        consumer.apply(CorsMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
