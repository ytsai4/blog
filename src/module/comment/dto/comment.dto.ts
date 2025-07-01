import { ApiProperty } from '@nestjs/swagger';

export class CommentDto {
    @ApiProperty({ description: '留言UUID' })
    UUID: string;

    @ApiProperty({ description: '內文' })
    Content: string;

    @ApiProperty({ description: '作者 UUID' })
    CreateBy: string;

    @ApiProperty({ description: '建立時間', type: String, format: 'date-time' })
    CreateDate: Date;
}
