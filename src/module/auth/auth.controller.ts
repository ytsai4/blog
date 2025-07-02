import { Controller, Get, Request, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '@src/common/decorators/public.decorator';
import { ChangeUserPwdDto, LoginDto } from './dto/auth.dto';
import { RequestData, RequestUserData } from '@src/common/utils/requestData';

@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('/login')
    @ApiOperation({ summary: '使用者登入認證，成功後回傳token' })
    @ApiBody({
        description: '使用者登入',
        type: LoginDto,
        examples: {
            admin: {
                value: {
                    account: 'admin',
                    password: 'admin',
                    rememberMe: false,
                },
            },
        },
    })
    async userAuthentication(@Body() data: LoginDto, @Request() req: any): Promise<Result> {
        const res = await this.authService.userAuthentication(data, req);
        return Result.ok('登入成功', res);
    }

    @ApiBearerAuth('access-token')
    @Post('/changePwd')
    @ApiOperation({ summary: '只有在使用者登入狀態下，可以更改自己的密碼' })
    @ApiBody({
        description: '密碼規則為:1.至少8碼 2.要有英文大小寫 3.要有數字 4.至少一個特殊符號',
        type: ChangeUserPwdDto,
        examples: {
            admin: {
                value: {
                    password: 'A_a12345',
                    newPassword: '123a1234',
                    confirmPassword: '123a1234',
                },
            },
        },
    })
    async changePwd(@Request() req: any, @Body() body: ChangeUserPwdDto): Promise<Result> {
        await this.authService.changePwd((req as RequestData)?.user, body);
        return Result.ok('使用者密碼更新成功');
    }
}
