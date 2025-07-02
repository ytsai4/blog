import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Delete } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiBody, ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CommentDto } from './dto/comment.dto';
import { ApiResponseDto } from '@src/common/dtos/api-response.dto';
@Public()
// @ApiBearerAuth('access-token')
@ApiTags('留言')
@Controller('Comment')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Get('')
    @ApiOperation({ summary: '取得所有留言' })
    @ApiResponse({ type: ApiResponseDto<CommentDto[]>, description: '取得留言成功' })
    async getAll(): Promise<Result> {
        const comment = await this.commentService.getAll();

        return;
    }
    @Post('/create')
    @ApiOperation({ summary: '新增商品' })
    @ApiBody({
        description: '新增商品',
        type: CreateCommentDto,
        examples: {
            'application/json': {
                summary: 'Example of creating a single comment',
                value: {
                    storeUuid: '27313070-cf95-42fb-b5f0-2ec567d5d691',
                    commentId: '25004470',
                    commentName: '得意五珍寶調和油2L',
                    commentDesc: ['獨家脂肪酸健康比例', '不飽和脂肪酸達92.5%', '油脂清爽穩定耐高溫低油煙'],
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
    async create(@Body() body: ManualCreateCommentDto): Promise<Result> {
        const { storeUuid, commentId, commentDesc, categoryUuidList, ...createFields } = body;
        const commentDescValue = commentDesc && commentDesc.length > 0 ? JSON.stringify(commentDesc) : null;

        // Upsert the comment
        const result = await this.commentService.newPost({
            storeUuid,
            commentId,
            commentDesc: commentDescValue,
            ...createFields,
        });
        if (!categoryUuidList && categoryUuidList.length === 0) {
            return Result.ok('商品新增成功', result);
        }
        for (const categoryUuid of categoryUuidList) {
            await this.commentService.addPostCategories(result.commentUuid, categoryUuid);
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
                summary: 'Example of updating a comment display',
                value: {
                    commentUuid: 'xxxxxxxx-xxxx-xxxx-xxxxxxxx',
                    storeUuid: '27313070-cf95-42fb-b5f0-2ec567d5d691',
                    commentId: '25004470',
                    commentName: '得意五珍寶調和油2L',
                    commentDesc: ['獨家脂肪酸健康比例', '不飽和脂肪酸達92.5%', '油脂清爽穩定耐高溫低油煙'],
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
        const result = await this.commentService.update(body);
        return Result.ok('商品更新成功', result);
    }
    @Get('/sync:storeUuid')
    @ApiOperation({ summary: '同步該店別商品資料' })
    @ApiParam({
        name: 'storeUuid',
        description: '店別uuid',
    })
    async syncPostData(@Param('storeUuid') storeUuid: string): Promise<Result> {
        const filepath = await this.commentService.findNewestFile(storeUuid);
        if (!filepath) {
            throw new HttpException('找不到最新的商品檔案', HttpStatus.NOT_FOUND);
        }
        const commentFailureList: { failure: SyncCommentDto; error: string }[] = [];
        const categoryFailureList: {
            failure: SyncCategoryDto;
            error: string;
        }[] = [];
        let successPostCount = 0;
        let successCategoryCount = 0;
        const { commentRows, categoryRows } = await this.commentService.readCSVFile(filepath);
        for (const row of categoryRows) {
            try {
                await this.categoryService.upsertByPK(row);
                successCategoryCount++;
            } catch (err) {
                categoryFailureList.push({ failure: row, error: err.message });
            }
        }
        for (const row of commentRows) {
            try {
                await this.commentService.upsertByPK(row);
                successPostCount++;
            } catch (err) {
                commentFailureList.push({ failure: row, error: err.message });
            }
        }

        const result = {
            successPostCount,
            successCategoryCount,
            commentFailureList,
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
                summary: 'Example of updating multiple comments display',
                value: {
                    commentUuidList: ['xxxxxxxx-xxxx-xxxx-xxxxxxxx', 'xxxxxxxx-xxxx-xxxx-xxxxxxxx'],
                    isDisplay: 'Y',
                    startDate: '2024-08-01',
                    endDate: '2024-08-05',
                },
            },
        },
    })
    async updateMultipleDisplay(@Body() body: UpdateMultipleDisplayDto): Promise<Result> {
        const result = await this.commentService.updateMultipleDisplay(body);
        return Result.ok('批量商品更新完成，請確認失敗商品代碼', result);
    }

    @Delete('')
    @ApiOperation({ summary: '刪除留言' })
    @ApiParam({
        name: 'UUID',
        description: '留言UUID',
        type: String,
    })
    async delete(@Param('UUID') UUID: string): Promise<Result> {
        await this.commentService.delete(UUID);
        return Result.ok('刪除留言成功');
    }
}
