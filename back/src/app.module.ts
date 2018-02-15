import * as passport from 'passport';
import { MiddlewaresConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorsMiddleware } from '@nest-middlewares/cors';

import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { GraphQLModule, GraphQLFactory } from '@nestjs/graphql';

import { Strategy as AnonymousStrategy } from 'passport-anonymous';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

import { AuthMiddleware } from './middlewares/auth.middleware';
import { SECRET_KEY } from './auth/constant';

@Module({
    imports: [TypeOrmModule.forRoot(), GraphQLModule, UserModule, AuthModule],
    controllers: [],
    components: [],
})
export class ApplicationModule implements NestModule {
    constructor(private readonly graphQLFactory: GraphQLFactory) {}

    configure(consumer: MiddlewaresConsumer): void {
        passport.use(new AnonymousStrategy());

        const graphqlRoute = { path: '/graphql', method: RequestMethod.ALL };

        consumer
            .apply(passport.authenticate(['jwt', 'anonymous'], { session: false }))
            .forRoutes(graphqlRoute);

        consumer
            .apply(passport.authenticate('jwt', { session: false }))
            .forRoutes(
                { path: '/auth/authorized', method: RequestMethod.ALL },
                { path: '/auth/me', method: RequestMethod.ALL },
                { path: '/user', method: RequestMethod.GET },
                { path: '/user/:id', method: RequestMethod.ALL },
            );

        // Graphql
        const typeDefs = this.graphQLFactory.mergeTypesByPaths('./**/*.graphql');
        const schema = this.graphQLFactory.createSchema({ typeDefs });

        consumer
            .apply(
                graphiqlExpress({
                    endpointURL: '/graphql',
                }),
            )
            .forRoutes({ path: '/graphiql', method: RequestMethod.GET })

            .apply(
                graphqlExpress(req => ({
                    schema,
                    rootValue: req,
                    context: {
                        user: req.user ? req.user.user : undefined,
                    },
                })),
            )
            .forRoutes(graphqlRoute);

        // Cros middleware
        consumer.apply(CorsMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
