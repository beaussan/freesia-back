import {
    Controller,
    Post,
    HttpStatus,
    HttpCode,
    Get,
    NotFoundException,
    UnauthorizedException,
    Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { UserConnected } from '../decorator/user.decorator';
import { LoginDto } from './login.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Controller('auth')
@ApiUseTags('Auth')
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) {}

    @Post('token')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, description: 'The token was correctly generated.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'There is no user with this login.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Password is wrong.' })
    public async getToken(@Body() login: LoginDto) {
        const maybeUser = await this.userService.findByEmail(login.email);
        if (!maybeUser.isPresent) {
            throw new NotFoundException();
        }
        const user = maybeUser.get();
        if (this.userService.doPasswordMatch(login.password, user)) {
            return await this.authService.createToken(user);
        }
        throw new UnauthorizedException();
    }

    @ApiBearerAuth()
    @Get('me')
    @ApiResponse({ status: HttpStatus.OK, description: 'The currently logged user.', type: User })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
    public async me(@UserConnected() user: User): Promise<User> {
        const userFromDb = await this.userService.findById(user.id);
        return userFromDb.orElseThrow(() => new UnauthorizedException());
    }
}
