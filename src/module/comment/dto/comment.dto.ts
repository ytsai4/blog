import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CommentDto {
    @Expose()
    @ApiProperty({ description: '留言UUID' })
    UUID: string;
    @Expose()
    @ApiProperty({ description: '內文' })
    Content: string;
    @Expose()
    @ApiProperty({ description: '作者 UUID' })
    CreateBy: string;
    @Expose()
    @ApiProperty({ description: '建立時間', type: String, format: 'date-time' })
    CreateDate: Date;
}
