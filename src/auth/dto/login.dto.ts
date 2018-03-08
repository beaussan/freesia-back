import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiModelProperty({ required: true })
    @IsString()
    @Length(6, 40)
    password: string;

    @ApiModelProperty({ required: true })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
