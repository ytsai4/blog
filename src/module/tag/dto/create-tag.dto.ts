import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsUUID, Length } from 'class-validator';

export class CreateTagDto {
    @ApiProperty({ description: '標籤名稱' })
    @IsString()
    @Length(1, 100)
    TagName: string;
}
