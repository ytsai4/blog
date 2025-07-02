import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiUnauthorizedResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { ApiErrorResponseDto } from '@src/common/dtos/api-error-response.dto';

export function ApiStandardErrors() {
    return applyDecorators(
        ApiBadRequestResponse({ description: 'Bad Request', type: ApiErrorResponseDto }),
        ApiUnauthorizedResponse({ description: 'Unauthorized', type: ApiErrorResponseDto }),
        ApiInternalServerErrorResponse({ description: 'Internal Server Error', type: ApiErrorResponseDto }),
    );
}
