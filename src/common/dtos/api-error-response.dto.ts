import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorData {
    @ApiProperty({ example: 'Something went wrong' })
    error: string;
}

export class ApiErrorResponseDto {
    @ApiProperty({ example: 500 })
    Code: number;

    @ApiProperty({ example: new Date().toISOString(), format: 'date-time' })
    ExecutionTime: string;

    @ApiProperty({ example: 'Internal server error' })
    Message: string;

    @ApiProperty({ type: ApiErrorData })
    Data: ApiErrorData;
}
