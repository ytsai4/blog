import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export class MetaDto {
    @ApiProperty({ example: 137, required: false })
    Total?: number;

    @ApiProperty({ example: 10, required: false })
    Limit?: number;

    @ApiProperty({ example: 0, required: false })
    Offset?: number;
}
export class ApiResponseDto<TData> {
    @ApiProperty({ example: 200 })
    Code: number;

    @ApiProperty({ example: new Date().toISOString(), format: 'date-time' })
    ExecutionTime: string;

    @ApiProperty({ example: 'Success' })
    Message: string;

    @ApiProperty()
    Data: TData;
    @ApiProperty({ type: MetaDto, required: false })
    Meta?: MetaDto;
}
