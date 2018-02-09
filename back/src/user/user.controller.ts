import {
    Body,
    ConflictException,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserRegisterDto } from './dto/user.register.dto';
import { ApiUseTags, ApiResponse, ApiImplicitParam, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../decorator/roles.decorator';
import { ROLE_ADMIN } from './authority.constants';
import { UserConnected } from '../decorator/user.decorator';

@ApiUseTags('User management')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @Roles(ROLE_ADMIN)
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: 'Get a list of all users.',
        type: User,
        isArray: true,
    })
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Post()
    @ApiResponse({
        status: 201,
        description: 'The user has been successfully created.',
        type: User,
    })
    @ApiResponse({
        status: 409,
        description: 'There is a conflict with the email or phone number.',
    })
    async register(@Body() userRegisterDto: UserRegisterDto): Promise<User> {
        const maybeUser = await this.userService.findByEmail(
            userRegisterDto.email.toLocaleLowerCase(),
        );
        if (maybeUser.isPresent) {
            throw new ConflictException('Email already taken');
        }
        return await this.userService.saveDto(userRegisterDto);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'The user with the matching id', type: User })
    @ApiResponse({ status: 404, description: 'Not found.' })
    @ApiImplicitParam({ type: Number, name: 'id', required: true })
    async findOne(@Param() params, @UserConnected() userLogged: User): Promise<User> {
        const { id } = params;
        if (!userLogged.authority.find(role => role.name === ROLE_ADMIN)) {
            userLogged.canDoOnEntityOrThrows('User', id, 'READ');
        }
        const user = await this.userService.findById(id);
        return user.orElseThrow(() => new NotFoundException());
    }
}
