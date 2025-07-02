import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UserDto {
    @ApiProperty({ description: '使用者UUID' })
    UUID: string;
    @ApiProperty({ description: '使用者帳號' })
    @IsString()
    @Length(4, 100)
    UserName: string;
    @ApiProperty({ description: '介紹文字' })
    @IsString()
    @Length(0, 255)
    Intro: string;
    @ApiProperty({ description: '名稱' })
    @IsString()
    @Length(0, 100)
    Name: string;
    @ApiProperty({ description: '信箱' })
    @IsString()
    @Length(0, 200)
    Email: string;
}
