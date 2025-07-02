import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({ description: '文章UUID' })
    Post: string;

    @ApiProperty({ description: '內文' })
    Content: string;
}
