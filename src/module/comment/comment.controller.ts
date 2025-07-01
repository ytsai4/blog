import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PostService } from './comment.service';
import { CategoryService } from '@src/modules/category/category.service';

import { ApiBody, ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Result } from '@src/common/utils/result';
import {
    UpdateMultipleDisplayDto,
    RequestAllPostByStoreDto,
    UpdateOneDto,
    DeletePostDto,
    CreatePostDto,
    CreatePostCategoryDto,
    ManualCreatePostDto,
    SyncPostDto,
    RequestAllPostByCategoryDto,
} from './dto/comment.dto';
import { error } from 'console';
import { CreateCategoryDto, SyncCategoryDto } from '../category/dto/category.dto';
import { CreateIndexesOptions } from 'typeorm';
import { Public } from '@src/common/decorators/public.decorator';
import { PostDto } from './dto/comment.dto';
import { ApiResponseDto } from '@src/common/dto/api-response.dto';
@Public()
// @ApiBearerAuth('access-token')
@ApiTags('留言')
@Controller('Comment')
export class CommentController {
    constructor(
        private readonly postService: PostService,
        private readonly categoryService: CategoryService,
    ) {}

    @Post('')
    @ApiOperation({ summary: '取得該店別的商品資訊' })
    @ApiBody({
        description: '依店別查詢商品',
        type: RequestAllPostByStoreDto,
        examples: {
            'application/json': {
                summary: 'Example of finding posts by store uuid',
                value: {
                    storeUuid: '27313070-cf95-42fb-b5f0-2ec567d5d691',
                    limit: 10,
                    offset: 0,
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: '取得商品資訊成功' })
    async getAll(@Body() body: RequestAllPostByStoreDto): Promise<Result> {
        const post = await this.postService.getPostsListByStoreId(body);

        return Result.ok('取得商品資訊成功', post);
    }
    @Get('')
    @ApiOperation({ summary: '取得所有文章' })
    @ApiBody({
        description: '依組別查詢商品',
        type: RequestAllPostByCategoryDto,
        examples: {
            'application/json': {
                summary: 'Example of finding posts by store uuid',
                value: {
                    categoryUuid: 'xxxxxxxx-xxxx-xxxx-xxxxxxxx',
                    limit: 10,
                    offset: 0,
                },
            },
        },
    })
    @ApiResponse({ type: ApiResponseDto<PostDto[]>, description: '取得文章列表成功' })
    async getAll(@Body() body: GetPostDto): Promise<Result> {
        const post = await this.postService.getPostsListByCategoryId(body);

        return Result.ok('取得商品資訊成功', post);
    }
    @Post('/create')
    @ApiOperation({ summary: '新增商品' })
    @ApiBody({
        description: '新增商品',
        type: CreatePostDto,
        examples: {
            'application/json': {
                summary: 'Example of creating a single post',
                value: {
                    storeUuid: '27313070-cf95-42fb-b5f0-2ec567d5d691',
                    postId: '25004470',
                    postName: '得意五珍寶調和油2L',
                    postDesc: ['獨家脂肪酸健康比例', '不飽和脂肪酸達92.5%', '油脂清爽穩定耐高溫低油煙'],
                    categoryIdList: ['80'],
                    standardPrice: 238,
                    saleAmount: 1,
                    salePrice: 225,
                    aisle: '8',
                    shelf: 2,
                    marketingMsg: null,
                    isDisplay: 'Y',
                    startDate: '2024-08-01',
                    endDate: '2024-08-05',
                },
            },
        },
    })
    async create(@Body() body: ManualCreatePostDto): Promise<Result> {
        const { storeUuid, postId, postDesc, categoryUuidList, ...createFields } = body;
        const postDescValue = postDesc && postDesc.length > 0 ? JSON.stringify(postDesc) : null;

        // Upsert the post
        const result = await this.postService.newPost({
            storeUuid,
            postId,
            postDesc: postDescValue,
            ...createFields,
        });
        if (!categoryUuidList && categoryUuidList.length === 0) {
            return Result.ok('商品新增成功', result);
        }
        for (const categoryUuid of categoryUuidList) {
            await this.postService.addPostCategories(result.postUuid, categoryUuid);
        }
        return Result.ok('商品新增成功', result);
    }
    @Post('/update')
    @ApiOperation({ summary: '變更單一商品' })
    @ApiBody({
        description: '變更單一商品',
        type: UpdateOneDto,
        examples: {
            'application/json': {
                summary: 'Example of updating a post display',
                value: {
                    postUuid: 'xxxxxxxx-xxxx-xxxx-xxxxxxxx',
                    storeUuid: '27313070-cf95-42fb-b5f0-2ec567d5d691',
                    postId: '25004470',
                    postName: '得意五珍寶調和油2L',
                    postDesc: ['獨家脂肪酸健康比例', '不飽和脂肪酸達92.5%', '油脂清爽穩定耐高溫低油煙'],
                    categoryUuidList: ['xxxxxxxx-xxxx-xxxx-xxxxxxxx'],
                    standardPrice: 238,
                    saleAmount: 1,
                    salePrice: 225,
                    aisle: '8',
                    shelf: 2,
                    marketingMsg: null,
                    isDisplay: 'Y',
                    startDate: '2024-08-01',
                    endDate: '2024-08-05',
                },
            },
        },
    })
    async update(@Body() body: UpdateOneDto): Promise<Result> {
        const result = await this.postService.update(body);
        return Result.ok('商品更新成功', result);
    }
    @Get('/sync:storeUuid')
    @ApiOperation({ summary: '同步該店別商品資料' })
    @ApiParam({
        name: 'storeUuid',
        description: '店別uuid',
    })
    async syncPostData(@Param('storeUuid') storeUuid: string): Promise<Result> {
        const filepath = await this.postService.findNewestFile(storeUuid);
        if (!filepath) {
            throw new HttpException('找不到最新的商品檔案', HttpStatus.NOT_FOUND);
        }
        const postFailureList: { failure: SyncPostDto; error: string }[] = [];
        const categoryFailureList: {
            failure: SyncCategoryDto;
            error: string;
        }[] = [];
        let successPostCount = 0;
        let successCategoryCount = 0;
        const { postRows, categoryRows } = await this.postService.readCSVFile(filepath);
        for (const row of categoryRows) {
            try {
                await this.categoryService.upsertByPK(row);
                successCategoryCount++;
            } catch (err) {
                categoryFailureList.push({ failure: row, error: err.message });
            }
        }
        for (const row of postRows) {
            try {
                await this.postService.upsertByPK(row);
                successPostCount++;
            } catch (err) {
                postFailureList.push({ failure: row, error: err.message });
            }
        }

        const result = {
            successPostCount,
            successCategoryCount,
            postFailureList,
            categoryFailureList,
        };

        return Result.ok('商品同步完成，請確認失敗商品資料', result);
    }
    @Post('/updateDisplays')
    @ApiOperation({ summary: '批量變更商品顯示' })
    @ApiBody({
        description: '批量變更商品顯示',
        type: UpdateMultipleDisplayDto,
        examples: {
            'application/json': {
                summary: 'Example of updating multiple posts display',
                value: {
                    postUuidList: ['xxxxxxxx-xxxx-xxxx-xxxxxxxx', 'xxxxxxxx-xxxx-xxxx-xxxxxxxx'],
                    isDisplay: 'Y',
                    startDate: '2024-08-01',
                    endDate: '2024-08-05',
                },
            },
        },
    })
    async updateMultipleDisplay(@Body() body: UpdateMultipleDisplayDto): Promise<Result> {
        const result = await this.postService.updateMultipleDisplay(body);
        return Result.ok('批量商品更新完成，請確認失敗商品代碼', result);
    }

    @Post('/remove')
    @ApiOperation({ summary: '刪除商品' })
    @ApiBody({
        description: '刪除商品',
        type: DeletePostDto,
        examples: {
            'application/json': {
                summary: 'Example of deleting a post',
                value: {
                    postUuid: 'xxxxxxxx-xxxx-xxxx-xxxxxxxx',
                },
            },
        },
    })
    async delete(@Body() body: DeletePostDto): Promise<Result> {
        await this.postService.deleteOne(body);
        return Result.ok('刪除商品成功');
    }
}
