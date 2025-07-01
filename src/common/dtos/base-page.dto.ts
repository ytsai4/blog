import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class BasePageDto {
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
