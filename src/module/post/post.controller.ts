import { Controller, Get, Post, Body, Param, Req, Patch, Delete } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBody, ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { Public } from '@src/common/decorators/public.decorator';
import { PostDto } from './dto/post.dto';
import { ApiResponseDto } from '@src/common/dtos/api-response.dto';
import { RequestWithUUID } from '@src/common/interfaces/request.interface';
import { createApiResponse } from '@src/common/utils/api-response.util';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostDto } from './dto/get-post.dto';
import { PostWithComments, PostWithLikes } from './interfaces/post.interface';
import { CommentService } from '../comment/comment.service';
import { ApiStandardErrors } from '@src/common/decorators/swagger-api-errors.decorator';

@ApiBearerAuth('access-token')
@ApiTags('文章')
@Controller('Post')
export class PostController {
    constructor(
        private readonly postService: PostService,
        private readonly commentService: CommentService,
    ) {}

    @Public()
    @Get(':UUID')
    @ApiOperation({ summary: '取得特定文章' })
    @ApiParam({
        name: 'UUID',
        description: '文章UUID',
        type: String,
        required: true,
    })
    @ApiResponse({ type: ApiResponseDto<PostWithComments>, description: '取得文章成功' })
    @ApiStandardErrors()
    async getOne(@Param('UUID') UUID: string): Promise<ApiResponseDto<PostWithComments>> {
        const post = await this.postService.getPostByUUID(UUID);
        const likes = await this.postService.countLikes(UUID);
        const comments = await this.commentService.getFiveByPost(UUID);
        const output: PostWithComments = { ...post, Likes: likes, Comments: comments };

        return createApiResponse(output);
    }
    @Public()
    @Get('')
    @ApiOperation({ summary: '取得所有文章' })
    @ApiBody({ type: GetPostDto })
    @ApiResponse({ type: ApiResponseDto<PostWithLikes[]>, description: '取得文章列表成功' })
    @ApiStandardErrors()
    async getAll(@Body() body: GetPostDto): Promise<ApiResponseDto<PostWithLikes[]>> {
        const { Data, Meta } = await this.postService.getALlPosts(body);
        const output = await this.postService.countLikesGrouped(Data);
        return createApiResponse(output, '取得文章列表成功', 200, Meta);
    }
    @Post('')
    @ApiOperation({ summary: '建立文章' })
    @ApiBody({
        type: CreatePostDto,
    })
    @ApiResponse({ type: ApiResponseDto<PostDto>, description: '建立文章成功' })
    async create(@Req() req: RequestWithUUID, @Body() body: CreatePostDto): Promise<ApiResponseDto<PostDto>> {
        console.log('req', req.UUID_User);
        const post = await this.postService.create(body, req.UUID_User);

        return createApiResponse(post);
    }
    @Patch('Like/:UUID')
    @ApiOperation({ summary: '按讚/收回讚' })
    @ApiParam({
        name: 'UUID',
        description: '文章UUID',
        type: String,
    })
    @ApiResponse({ type: ApiResponseDto<{ Likes: number }>, description: '按讚/收回讚成功' })
    @ApiStandardErrors()
    async like(@Req() req: RequestWithUUID, @Param('UUID') UUID: string): Promise<ApiResponseDto<{ Likes: number }>> {
        const Likes = await this.postService.like(UUID, req.UUID_User);
        return createApiResponse({ Likes });
    }
    @Patch('')
    @ApiOperation({ summary: '編輯文章' })
    @ApiBody({
        type: UpdatePostDto,
    })
    @ApiResponse({ type: ApiResponseDto<PostDto>, description: '編輯文章成功' })
    @ApiStandardErrors()
    async update(@Body() body: UpdatePostDto, @Req() req: RequestWithUUID): Promise<ApiResponseDto<PostDto>> {
        const post = await this.postService.update(body, req.UUID_User);
        return createApiResponse(post);
    }
    @Delete(':UUID')
    @ApiOperation({ summary: '刪除文章' })
    @ApiParam({
        name: 'UUID',
        description: '文章UUID',
        type: String,
    })
    @ApiResponse({ type: ApiResponseDto<{}>, description: '刪除文章成功' })
    @ApiStandardErrors()
    async delete(@Req() req: RequestWithUUID, @Param('UUID') UUID: string): Promise<ApiResponseDto<{}>> {
        await this.postService.delete(UUID, req.UUID_User);
        return createApiResponse({});
    }
}
