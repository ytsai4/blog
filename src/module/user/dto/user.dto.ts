import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class UserDto {
    @Expose()
    @ApiProperty({ description: '使用者UUID' })
    UUID: string;
    @Expose()
    @ApiProperty({ description: '使用者帳號' })
    @IsString()
    @Length(4, 100)
    UserName: string;
    @Expose()
    @ApiProperty({ description: '介紹文字' })
    @IsString()
    @Length(0, 255)
    Intro: string;
    @Expose()
    @ApiProperty({ description: '名稱' })
    @IsString()
    @Length(0, 100)
    Name: string;
    @Expose()
    @ApiProperty({ description: '信箱' })
    @IsString()
    @Length(0, 200)
    Email: string;
}
