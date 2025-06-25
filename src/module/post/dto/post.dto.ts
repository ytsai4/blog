import { ApiProperty } from '@nestjs/swagger';

export class PostDto {
    @ApiProperty({ description: '文章UUID' })
    UUID: string;

    @ApiProperty({ description: '標題' })
    Title: string;

    @ApiProperty({ description: '內文' })
    Content: string;

    @ApiProperty({ description: '發布時間', type: String, format: 'date-time', nullable: true })
    PublishDate: Date | null;

    @ApiProperty({ description: '作者 UUID' })
    CreateBy: string;

    @ApiProperty({ description: '建立時間', type: String, format: 'date-time' })
    CreateDate: Date;

    @ApiProperty({ description: '更新時間', type: String, format: 'date-time', nullable: true })
    UpdateDate: Date | null;
}
