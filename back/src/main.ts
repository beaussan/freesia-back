import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { UserModule } from './user/user.module';
import { RolesGuard } from './gard/roles.guard';

async function bootstrap() {
    const app = await NestFactory.create(ApplicationModule);

    const authGuard = app.select(UserModule).get(RolesGuard);

    app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

    app.useGlobalPipes(new ValidationPipe());

    app.useGlobalGuards(authGuard);

    await app.listen(3000);
}
bootstrap();
