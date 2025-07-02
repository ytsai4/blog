import { ApiProperty } from '@nestjs/swagger';
import { BasePageDto } from '@src/common/dtos/base-page.dto';
import { IsArray, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { IsDateString } from 'class-validator';

export class GetPostDto extends BasePageDto {
    @ApiProperty({ description: '標籤', isArray: true, type: String })
    @ValidateIf((o) => o.Tag !== undefined)
    @IsArray()
    @IsString({ each: true })
    @MaxLength(200, { each: true })
    Tag?: string[];

    @ApiProperty({ description: '作者', maxLength: 200 })
    @ValidateIf((o) => o.Author !== undefined)
    @IsString()
    @MaxLength(200)
    Author?: string;

    @ApiProperty({ description: '關鍵字', required: false, type: String })
    @ValidateIf((o) => o.Author !== undefined)
    @IsString()
    KeyWord?: string;
}
