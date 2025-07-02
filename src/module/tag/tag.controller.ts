import { Controller, Get, Post, Body, Param, Delete, Req } from '@nestjs/common';
import { TagService } from './tag.service';
import { ApiBody, ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { TagDto } from './dto/tag.dto';
import { ApiResponseDto } from '@src/common/dtos/api-response.dto';
import { createApiResponse } from '@src/common/utils/api-response.util';
import { CreateTagDto } from './dto/create-tag.dto';
import { ApiStandardErrors } from '@src/common/decorators/swagger-api-errors.decorator';
@ApiBearerAuth('access-token')
@ApiTags('標籤')
@Controller('Tag')
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Get('')
    @ApiOperation({ summary: '取得所有標籤' })
    @ApiResponse({ type: ApiResponseDto<TagDto[]>, description: '取得標籤成功' })
    @ApiStandardErrors()
    async getAll(): Promise<ApiResponseDto<TagDto[]>> {
        const tags = await this.tagService.getAllTags();
        return createApiResponse(tags);
    }
    @Post('')
    @ApiOperation({ summary: '新增標籤' })
    @ApiBody({ type: CreateTagDto })
    @ApiResponse({ type: ApiResponseDto<TagDto>, description: '新增標籤成功' })
    @ApiStandardErrors()
    async create(@Req() @Body() body: CreateTagDto): Promise<ApiResponseDto<TagDto>> {
        const tag = await this.tagService.create(body);
        return createApiResponse(tag);
    }
}
