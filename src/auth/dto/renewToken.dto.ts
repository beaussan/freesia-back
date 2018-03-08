import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class RenewTokenDto {
    @ApiModelProperty({ required: true })
    @IsString()
    refreshToken: string;
}
