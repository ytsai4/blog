import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';
export class ApiResponseDto<TData> {
    @ApiProperty({ example: 200 })
    Code: number;

    @ApiProperty({ example: new Date().toISOString(), format: 'date-time' })
    ExecutionTime: string;

    @ApiProperty({ example: 'Success' })
    Message: string;

    @ApiProperty()
    Data: TData;
}

export function ApiResponse<T>(dataModel: Type<T>) {
    class ApiResponseClass extends ApiResponseDto<T> {
        @ApiProperty({ type: dataModel })
        Data: T;
    }
    return ApiResponseClass;
}
