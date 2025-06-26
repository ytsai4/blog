import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';

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
    PublishDate?: Date;
}
