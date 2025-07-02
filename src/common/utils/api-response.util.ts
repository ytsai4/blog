import { ApiResponseDto, MetaDto } from '@src/common/dtos/api-response.dto';

export function createApiResponse<T>(
    data: T,
    message = 'Success',
    code = 200,
    meta?: MetaDto,
    executionTime: string = new Date().toISOString(),
): ApiResponseDto<T> {
    return {
        Code: code,
        ExecutionTime: executionTime,
        Message: message,
        Data: data,
        ...(meta && { Meta: meta }),
    };
}
