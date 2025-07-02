import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '@src/common/decorators/public.decorator';
import { LoginDto } from './dto/log-in.dto';
import { ApiResponseDto } from '@src/common/dtos/api-response.dto';
import { createApiResponse } from '@src/common/utils/api-response.util';
import { Token } from '@src/common/interfaces/request.interface';
import { ApiStandardErrors } from '@src/common/decorators/swagger-api-errors.decorator';

@Public()
@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/Login')
    @ApiOperation({ summary: '使用者登入認證，成功後回傳token' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ type: ApiResponseDto<Token> })
    @ApiStandardErrors()
    async authentication(@Body() data: LoginDto): Promise<ApiResponseDto<Token>> {
        const res = await this.authService.userAuthentication(data);
        return createApiResponse(res);
    }

    @Post('')
    @ApiOperation({ summary: '註冊使用者' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ type: ApiResponseDto<Token> })
    @ApiStandardErrors()
    async create(@Body() data: LoginDto): Promise<ApiResponseDto<Token>> {
        const res = await this.authService.create(data);
        return createApiResponse(res);
    }
}
