import { ApiProperty } from '@nestjs/swagger';
import { BasePageDto } from '@src/common/dtos/base-page.dto';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsDateString } from 'class-validator';

export class GetPostDto extends BasePageDto {
    @ApiProperty({ description: '標籤', isArray: true, type: String })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(200, { each: true })
    Tag?: string[];

    @ApiProperty({ description: '作者', maxLength: 200 })
    @IsString()
    @MaxLength(200)
    Author?: string;

    @ApiProperty({ description: '關鍵字', required: false, type: String })
    @IsOptional()
    @IsString()
    KeyWord?: string;
}
