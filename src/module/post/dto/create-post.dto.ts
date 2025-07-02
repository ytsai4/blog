import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, MaxLength, IsArray } from 'class-validator';

export class CreatePostDto {
    @ApiProperty({ description: '標題', maxLength: 200 })
    @IsString()
    @MaxLength(200)
    Title: string;

    @ApiProperty({ description: '內文', maxLength: 4000 })
    @IsString()
    @MaxLength(4000)
    Content: string;
    @ApiProperty({ description: '發布時間', required: false, type: String, format: 'date-time' })
    @IsOptional()
    @IsDateString()
    PublishDate?: string;
    @ApiProperty({
        description: '標籤UUID陣列',
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    Tags?: string[];
}
