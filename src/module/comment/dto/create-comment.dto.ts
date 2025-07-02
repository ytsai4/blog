import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty({ description: '文章UUID' })
    @IsUUID()
    Post: string;

    @ApiProperty({ description: '內文' })
    @IsString()
    @Length(1, 4000)
    Content: string;
}
