import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { IsDateString } from 'class-validator';
export class BasePageDto {
    @ApiProperty({
        description: '從第幾筆之後開始',
        type: Number,
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    offset?: number;

    @ApiProperty({
        description: '顯示資料量',
        type: Number,
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    limit?: number;
}
export class GetPostDto extends BasePageDto {
    @ApiProperty({ description: '標籤', maxLength: 200 })
    @IsString()
    @MaxLength(200)
    Tags: string;

    @ApiProperty({ description: '作者', maxLength: 200 })
    @IsString()
    @MaxLength(200)
    Author: string;

    @ApiProperty({ description: '關鍵字', required: false, type: String })
    @IsOptional()
    @IsString()
    KeyWord?: string;

    @ApiProperty({ description: '發布時間', required: false, type: String, format: 'date-time' })
    @IsOptional()
    @IsDateString()
    PublishDate?: String;
}
