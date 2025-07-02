import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
    @ApiProperty({ description: '帳號' })
    @IsString()
    @IsNotEmpty()
    @Length(4, 100)
    UserName: string;

    @ApiProperty({ description: '密碼' })
    @IsString()
    @IsNotEmpty()
    @Length(8, 200)
    Password: string;
}
