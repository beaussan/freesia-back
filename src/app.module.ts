import * as passport from 'passport';
import { MiddlewaresConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorsMiddleware } from '@nest-middlewares/cors';

import { formatResponse } from 'apollo-logger';

import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { GraphQLModule, GraphQLFactory } from '@nestjs/graphql';

import { Strategy as AnonymousStrategy } from 'passport-anonymous';

import { AppModule } from './app/app.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL || 'postgres://dashy:passwdlol@localhost:5432/dashy',
            entities: [__dirname + '/../**/**.entity{.ts,.js}'],
            synchronize: true,
            cli: {
                migrationsDir: __dirname + '/../src/migration',
            },
            // logging: 'all',
        }),
        GraphQLModule,
        AppModule,
        AuthModule,
    ],
    controllers: [],
    components: [],
})
export class ApplicationModule implements NestModule {
    constructor(private readonly graphQLFactory: GraphQLFactory) {}

    configure(consumer: MiddlewaresConsumer): void {
        // Cros middleware
        consumer.apply(CorsMiddleware).forRoutes({ path: '**', method: RequestMethod.ALL });

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
                graphqlExpress((req: any) => ({
                    schema,
                    formatResponse,
                    rootValue: req,
                    context: {
                        user: req.user ? req.user.user : undefined,
                    },
                })),
            )
            .forRoutes(graphqlRoute);
    }
}
