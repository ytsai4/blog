import { Controller, Get, Post, Body, Param, Delete, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiBody, ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CommentDto } from './dto/comment.dto';
import { ApiResponseDto } from '@src/common/dtos/api-response.dto';
import { createApiResponse } from '@src/common/utils/api-response.util';
import { CreateCommentDto } from './dto/create-comment.dto';
import { RequestWithUUID } from '@src/common/interfaces/request.interface';
import { ApiStandardErrors } from '@src/common/decorators/swagger-api-errors.decorator';
@ApiBearerAuth('access-token')
@ApiTags('留言')
@Controller('Comment')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Get('/Post/:UUID')
    @ApiOperation({ summary: '取得文章所有留言' })
    @ApiParam({ name: 'UUID', type: String, description: '文章UUID' })
    @ApiResponse({ type: ApiResponseDto<CommentDto[]>, description: '取得留言成功' })
    @ApiStandardErrors()
    async getAllByPost(@Param('UUID') UUID: string): Promise<ApiResponseDto<CommentDto[]>> {
        const comments = await this.commentService.getAllByPost(UUID);
        return createApiResponse(comments);
    }
    @Post('')
    @ApiOperation({ summary: '新增留言' })
    @ApiBody({ type: CreateCommentDto })
    @ApiResponse({ type: ApiResponseDto<CommentDto>, description: '新增留言成功' })
    @ApiStandardErrors()
    async create(@Req() req: RequestWithUUID, @Body() body: CreateCommentDto): Promise<ApiResponseDto<CommentDto>> {
        const comment = await this.commentService.create(body, req.UUID_User);
        return createApiResponse(comment);
    }

    @Delete(':UUID')
    @ApiOperation({ summary: '刪除留言' })
    @ApiParam({
        name: 'UUID',
        description: '留言UUID',
        type: String,
    })
    @ApiResponse({ type: ApiResponseDto<{}>, description: '刪除留言成功' })
    @ApiStandardErrors()
    async delete(@Req() req: RequestWithUUID, @Param('UUID') UUID: string): Promise<ApiResponseDto<{}>> {
        await this.commentService.delete(UUID, req.UUID_User);
        return createApiResponse({});
    }
}
