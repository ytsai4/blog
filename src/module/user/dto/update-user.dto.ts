import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, ValidateIf } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({ description: '使用者帳號', required: false })
    @ValidateIf((obj) => obj.UserName !== undefined)
    @IsString()
    @Length(4, 100)
    UserName?: string;
    @ApiProperty({ description: '介紹文字', required: false })
    @ValidateIf((obj) => obj.UserName !== undefined)
    @IsString()
    @Length(0, 255)
    Intro?: string;
    @ApiProperty({ description: '名稱', required: false })
    @ValidateIf((obj) => obj.UserName !== undefined)
    @IsString()
    @Length(0, 100)
    Name?: string;
    @ApiProperty({ description: '信箱', required: false })
    @ValidateIf((obj) => obj.UserName !== undefined)
    @IsString()
    @Length(0, 200)
    Email?: string;
}
