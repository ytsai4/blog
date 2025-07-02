import { Controller, Get, Post, Body, Param, Delete, Req, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { ApiResponseDto } from '@src/common/dtos/api-response.dto';
import { createApiResponse } from '@src/common/utils/api-response.util';
import { RequestWithUUID } from '@src/common/interfaces/request.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiStandardErrors } from '@src/common/decorators/swagger-api-errors.decorator';
@ApiBearerAuth('access-token')
@ApiTags('使用者')
@Controller('User')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/ChangePassword')
    @ApiOperation({ summary: '變更密碼' })
    @ApiBody({ type: ChangePasswordDto })
    @ApiResponse({ type: ApiResponseDto<{}>, description: '變更密碼成功' })
    @ApiStandardErrors()
    async changePwd(@Body() body: ChangePasswordDto, @Req() req: RequestWithUUID): Promise<ApiResponseDto<{}>> {
        await this.userService.changePwd(req.UUID_User, body);
        return createApiResponse({});
    }

    @Patch('')
    @ApiOperation({ summary: '編輯使用者' })
    @ApiBody({
        type: UpdateUserDto,
    })
    @ApiResponse({ type: ApiResponseDto<UserDto>, description: '編輯使用者成功' })
    @ApiStandardErrors()
    async delete(@Req() req: RequestWithUUID, @Body() data: UpdateUserDto): Promise<ApiResponseDto<UserDto>> {
        const user = await this.userService.update(req.UUID_User, data);
        return createApiResponse(user);
    }
    @Get('')
    @ApiOperation({ summary: '取得使用者' })
    @ApiResponse({ type: ApiResponseDto<UserDto>, description: '取得使用者成功' })
    @ApiStandardErrors()
    async getOne(@Req() req: RequestWithUUID): Promise<ApiResponseDto<UserDto>> {
        const user = await this.userService.getByUUID(req.UUID_User);
        return createApiResponse(user);
    }
}
