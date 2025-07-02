import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class BasePageDto {
    @Expose()
    @ApiProperty({
        description: '從第幾筆之後開始',
        type: Number,
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    Offset?: number;
    @Expose()
    @ApiProperty({
        description: '顯示資料量',
        type: Number,
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    Limit?: number;
}
