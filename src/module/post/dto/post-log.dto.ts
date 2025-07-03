import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PostLogDto {
    @Expose()
    @ApiProperty({ description: 'UUID' })
    UUID: string;
    @Expose()
    @ApiProperty({ description: '文章UUID' })
    Post: string;
    @Expose()
    @ApiProperty({ description: '標題' })
    Title: string;
    @Expose()
    @ApiProperty({ description: '內文' })
    Content: string;
    @Expose()
    @ApiProperty({ description: '發布時間', type: String, format: 'date-time', nullable: true })
    PublishDate: Date | null;
    @Expose()
    @ApiProperty({ description: '作者 UUID' })
    CreateBy: string;
    @Expose()
    @ApiProperty({ description: '建立時間', type: String, format: 'date-time' })
    CreateDate: Date;
}
