import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({ description: '舊密碼' })
    @IsNotEmpty()
    @IsString()
    @Length(8, 200)
    readonly Password: string;

    @ApiProperty({ description: '新密碼' })
    @IsNotEmpty()
    @IsString()
    @Length(8, 200)
    readonly NewPassword: string;

    @ApiProperty({ description: '驗證密碼' })
    @IsNotEmpty()
    @IsString()
    @Length(8, 200)
    readonly ConfirmPassword: string;
}
