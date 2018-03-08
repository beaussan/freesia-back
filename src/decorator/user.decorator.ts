import { createRouteParamDecorator } from '@nestjs/common';
import { User as UserClass } from '../user/user.entity';
import { plainToClass } from 'class-transformer';

export const UserConnected = createRouteParamDecorator((data, req): any => {
    return plainToClass(UserClass, req.user.user);
});
