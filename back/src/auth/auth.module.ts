import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
    components: [AuthService, JwtStrategy],
    controllers: [],
    imports: [forwardRef(() => UserModule)],
    exports: [AuthService],
})
export class AuthModule {}
