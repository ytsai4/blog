import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export class MetaDto {
    @ApiProperty({ example: 137, required: false })
    total?: number;

    @ApiProperty({ example: 10, required: false })
    limit?: number;

    @ApiProperty({ example: 0, required: false })
    offset?: number;
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
