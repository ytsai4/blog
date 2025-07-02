import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TagDto {
    @Expose()
    @ApiProperty({ description: '標籤UUID' })
    UUID: string;
    @Expose()
    @ApiProperty({ description: '標籤名稱' })
    TagName: string;
}
