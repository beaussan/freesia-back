import { ApiModelProperty } from '@nestjs/swagger';
import { IsEmail, IsMobilePhone, IsNotEmpty, IsString, Length } from 'class-validator';

export class UserRegisterDto {
    id: number;

    @ApiModelProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiModelProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiModelProperty({ required: true })
    @IsString()
    @Length(6, 40)
    password: string;

    @ApiModelProperty({ required: true })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiModelProperty({ required: true })
    @IsMobilePhone('fr-FR')
    @IsNotEmpty()
    phone: string;
}
