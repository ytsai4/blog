import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as csvParser from 'csv-parser';
import * as iconv from 'iconv-lite';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../../common/entities/post.entity';
import { DataSource, In, Not, QueryRunner, Repository } from 'typeorm';
import { PostTagEntity } from './entities/post-tag.entity';
import {
    OutputPostDto,
    RequestAllPostByStoreDto,
    OutputAllPostDto,
    UpdateMultipleDisplayDto,
    UpdateFailDto,
    UpdateOneDto,
    CreatePostTagDto,
    DeletePostDto,
    SyncPostDto,
    ManualCreatePostDto,
    CreatePostDto,
    RequestAllPostByTagDto,
} from './dto/post.dto';
import { BaseService } from '../_base/base.service';
import { CreateTagDto, SyncTagDto } from '../category/dto/category.dto';
import { TagEntity } from '../category/entities/category.entity';
import { StoreEntity } from '../store/entities/store.entity';
import { mapToDto } from 'utils/mapper';
@Injectable()
export class PostService extends BaseService<PostEntity> {
    constructor(
        @InjectRepository(PostEntity)
        private readonly postRepo: Repository<PostEntity>,

        @InjectRepository(PostTagEntity)
        private readonly postTagRepo: Repository<PostTagEntity>,

        @InjectRepository(TagEntity)
        private readonly categoryRepo: Repository<TagEntity>,

        @InjectRepository(StoreEntity)
        private readonly storeRepo: Repository<StoreEntity>,
    ) {
        super(postRepo);
    }

    /**
     * 使用 [storeUuid] 取得產品資料
     * @param storeUuid
     * @returns
     */
    async getALlPosts(body: RequestAllPost): Promise<PostDto> {
        const { limit, offset } = body;
        const total = await this.postRepo.count({
            where: { storeUuid },
        });
        const queryOptions: any = {
            where: { storeUuid },
            order: {
                updateTime: 'DESC',
            },
        };

        // Conditionally add pagination
        if (limit !== undefined && limit > 0) {
            queryOptions.take = limit;
            if (offset !== undefined && offset >= 0 && offset < total) {
                queryOptions.skip = offset;
            }
        }

        const dto = mapToDto(PostDto, postEntity);

        return { data: outputData, total: total };
    }
    /**
     * 使用 [categoryUuid] 取得產品資料
     * @param categoryUuid
     * @returns
     */
    async getPostsListByTagId(body: RequestAllPostByTagDto): Promise<OutputAllPostDto> {
        const { categoryUuid, limit, offset } = body;
        const posts = await this.postTagRepo.find({
            where: { categoryUuid },
        });
        const total = await this.postRepo.count({
            where: { postUuid: In(posts.map((p) => p.postUuid)) },
        });
        const queryOptions: any = {
            where: { postUuid: In(posts.map((p) => p.postUuid)) },
            order: {
                updateTime: 'DESC',
            },
        };

        // Conditionally add pagination
        if (limit !== undefined && limit > 0) {
            queryOptions.take = limit;
            if (offset !== undefined && offset >= 0 && offset < total) {
                queryOptions.skip = offset;
            }
        }

        const result: PostEntity[] = (await this.postRepo.find(queryOptions)) as PostEntity[];

        const outputData = await this.transformPost(result);

        return { data: outputData, total: total };
    }
    /**
     * 使用 [postId] 取得產品圖片
     * @param postId
     * @returns
     */
    async getPictureListByPostId(postId: string): Promise<string[]> {
        // const dirPath = path.resolve(__dirname, '..', 'data');
        const dirPath = '/app/images';
        try {
            const files = await fs.promises.readdir(dirPath);
            const images = files.filter((file) => file.startsWith(postId));
            return images;
        } catch (err) {
            console.error('Unable to scan directory:', err);
            return [];
        }
    }

    /**
     * 使用 [postUuid] 取得產品組別資料
     * @param postUuid
     * @returns
     */
    async getTagIdsForPost(postUuid: string): Promise<string[]> {
        const result = await this.postTagRepo.find({
            select: ['categoryUuid'],
            where: { postUuid },
        });

        return result.map((row) => row.categoryUuid);
    }
    /**
     * 使用 [postList] 轉換輸出產品資料
     * @param postList
     *
     */
    async transformPost(postList: PostEntity[]): Promise<OutputPostDto[]> {
        const outputPostList: OutputPostDto[] = [];
        for (const post of postList) {
            const postDesc = JSON.parse(post.postDesc) || [];
            // Fetch related data in parallel
            const [postImage, categoryIdList] = await Promise.all([
                this.getPictureListByPostId(post.postId),
                this.getTagIdsForPost(post.postUuid),
            ]);
            outputPostList.push({
                postUuid: post.postUuid,
                storeUuid: post.storeUuid,
                postId: post.postId,
                postName: post.postName,
                postDesc: postDesc,
                pictureList: postImage,
                categoryUuidList: categoryIdList,
                standardPrice: post.standardPrice,
                saleAmount: post.saleAmount,
                salePrice: post.salePrice,
                aisle: post.aisle,
                shelf: post.shelf,
                marketingMsg: post.marketingMsg,
                isDisplay: post.isDisplay,
                startDate: post.startDate,
                endDate: post.endDate,
                createTime: post.createTime,
                updateTime: post.updateTime,
            });
        }

        return outputPostList;
    }

    /**
     * 更新產品
     * @param body
     */
    async update(body: UpdateOneDto): Promise<{ data: OutputPostDto[] }> {
        const { postUuid, storeUuid, postId, categoryUuidList, postDesc, ...updateFields } = body;
        const postDescValue =
            postDesc === undefined
                ? undefined
                : postDesc === null
                  ? null
                  : postDesc.length > 0
                    ? JSON.stringify(postDesc)
                    : null;
        if (postId) {
            const duplicate = await this.postRepo.findOne({
                where: { storeUuid, postId, postUuid: Not(postUuid) },
            });
            if (duplicate) {
                throw new HttpException('商品代碼已存在', HttpStatus.CONFLICT);
            }
        }
        const result = await this.postRepo.update(
            { postUuid },
            { ...updateFields, postDesc: postDescValue, postId: postId },
        );
        if (result.affected === 0) {
            throw new HttpException('商品未找到', HttpStatus.NOT_FOUND);
        }
        await this.removePostCategories(postUuid);
        for (const categoryUuid of categoryUuidList) {
            await this.addPostCategories(postUuid, categoryUuid);
        }
        const post = await this.postRepo.findOne({ where: { postUuid } });
        const outputData = await this.transformPost([post]);
        return { data: outputData };
    }
    /**
     * 讀取CSV商品資料
     * @param storeId
     * @returns
     */
    async findNewestFile(storeUuid: string): Promise<string | null> {
        try {
            const dirPath = '/app/data';
            const files = await fs.promises.readdir(dirPath);
            const store = await this.storeRepo.findOne({ where: { storeUuid } });
            if (!store) {
                throw new HttpException('查無此商店', HttpStatus.NOT_FOUND);
            }
            // Filter files based on the specified format
            const filteredFiles = files.filter((file) => file.match(`^Post_${store.storeId}_\\d{8}\\.(csv)$`));

            if (filteredFiles.length === 0) {
                console.log('No files found matching the specified format.');
                return null;
            }

            // Map files to their stats
            const fileStats = await Promise.all(
                filteredFiles.map(async (file) => {
                    const filePath = path.join(dirPath, file);
                    const stats = await fs.promises.stat(filePath);
                    return { filePath, mtime: stats.mtime };
                }),
            );

            // Find the file with the newest modification time
            const newestFile = fileStats.reduce((latest, current) => (current.mtime > latest.mtime ? current : latest));

            console.log('Newest file:', newestFile.filePath);
            return newestFile.filePath;
        } catch (err) {
            console.error('Error finding the newest file:', err);
            return null;
        }
    }
    /**
     * 讀取CSV商品資料
     * @param filePath
     * @returns
     */
    async readCSVFile(filePath: string): Promise<{
        postRows: SyncPostDto[];
        categoryRows: SyncTagDto[];
    }> {
        const readStream = fs.createReadStream(filePath).pipe(iconv.decodeStream('utf8'));
        const postRows = [];
        const categoryRows = [];
        const relationRows = [];
        const parser = readStream.pipe(csvParser());
        await new Promise((resolve, reject) => {
            parser.on('data', (row) => {
                const categoryPack = {
                    storeId: row['店別'],
                    categoryId: row['組別'],
                    categoryName: row['名稱'],
                };
                if (
                    !categoryRows.some(
                        (existing) =>
                            existing.storeId === categoryPack.storeId &&
                            existing.categoryId === categoryPack.categoryId &&
                            existing.categoryName === categoryPack.categoryName,
                    )
                ) {
                    categoryRows.push(categoryPack);
                }
                const desc = [];
                if (row.BCPOP_PRO1 && typeof row.BCPOP_PRO1 === 'string') {
                    row.BCPOP_PRO1.trim();
                    desc.push(row.BCPOP_PRO1);
                }
                if (row.BCPOP_PRO2 && typeof row.BCPOP_PRO2 === 'string') {
                    row.BCPOP_PRO2.trim();
                    desc.push(row.BCPOP_PRO2);
                }
                if (row.BCPOP_PRO3 && typeof row.BCPOP_PRO3 === 'string') {
                    row.BCPOP_PRO3.trim();
                    desc.push(row.BCPOP_PRO3);
                }
                postRows.push({
                    storeId: row['店別'],
                    categoryId: row['組別'],
                    postId: row['商品代碼'],
                    postName: row['品名'],
                    standardPrice: parseFloat(row['售價']) || null,
                    saleAmount: parseInt(row['特賣數量']) || null,
                    salePrice: parseFloat(row['特賣售價']) || null,
                    aisle: row['道'] ? String(row['道']) : null,
                    shelf: parseInt(row['架']) || null,
                    marketingMsg: row.MARKETING_MSG ? row.MARKETING_MSG : null,
                    postDesc: JSON.stringify(desc),
                });
            });
            parser.on('end', resolve);
            parser.on('error', reject);
        });
        return { postRows, categoryRows };
    }

    /**
     * 更新或插入產品資料及關連資料
     * @param body
     */
    async upsertByPK(body: SyncPostDto): Promise<void> {
        const { storeId, categoryId, postId, ...rest } = body;
        const store = await this.storeRepo.findOne({ where: { storeId } });
        if (!store) {
            throw new HttpException('店家不存在', HttpStatus.NOT_FOUND);
        }
        // Check for duplicate post in the same store
        const duplicate = await this.postRepo.findOne({ where: { storeUuid: store.storeUuid, postId } });
        // Upsert the post
        let post: PostEntity;
        if (duplicate) {
            post = await this.postRepo.save({
                postUuid: duplicate.postUuid,
                storeUuid: store.storeUuid,
                postId,
                ...rest,
            });
        } else {
            post = this.postRepo.create({ storeUuid: store.storeUuid, postId, ...rest });
            post = await this.postRepo.save(post);
        }

        // Check if category exists
        const category = await this.categoryRepo.findOne({ where: { storeUuid: store.storeUuid, categoryId } });
        if (!category) {
            throw new HttpException('類別不存在', HttpStatus.NOT_FOUND);
        }

        // Create or update the post-category relation
        const relation = this.postTagRepo.create({
            postUuid: post.postUuid,
            categoryUuid: category.categoryUuid,
        });
        await this.postTagRepo.save(relation);
    }
    /**
     * 插入產品資料
     * @param body
     * @returns
     */
    async newPost(body: CreatePostDto): Promise<PostEntity> {
        const { storeUuid, postId } = body;
        const duplicate = this.postRepo.findOne({ where: { storeUuid, postId } });
        if (duplicate) {
            throw new HttpException('商品代碼已存在', HttpStatus.CONFLICT);
        }
        const post = this.postRepo.create(body);
        const result = await this.postRepo.save(post);
        return result;
    }
    /**
     * 更新或插入產品關聯類別資料
     * @param body
     * @returns
     */
    async upsertRelationByPK(body: CreatePostTagDto): Promise<CreatePostTagDto> {
        const result = await this.postTagRepo.save(body);
        return result;
    }

    /**
     * 批量更新顯示設定
     * @param body
     */
    async updateMultipleDisplay(body: UpdateMultipleDisplayDto): Promise<UpdateFailDto> {
        const { postUuidList, ...updateFields } = body;
        const failPostList = [];
        for (const postUuid of postUuidList) {
            try {
                const result = await this.postRepo.update({ postUuid }, updateFields);
                if (result.affected === 0) {
                    throw new HttpException('商品未找到', HttpStatus.NOT_FOUND);
                }
            } catch (err) {
                failPostList.push(postUuid);
            }
        }
        return { data: failPostList };
    }
    /**
     * 新增類別商品關聯
     * @param storeId
     * @param postId
     */
    async addPostCategories(postUuid: string, categoryUuid: string): Promise<void> {
        // Find the category
        const category = await this.categoryRepo.find({
            where: { categoryUuid },
        });

        // Remove the entities if they exist
        if (category.length === 0) {
            return;
        }
        await this.postTagRepo.save({ postUuid, categoryUuid });
    }
    /**
     * 刪除類別商品關聯
     * @param storeId
     * @param postId
     */
    async removePostCategories(postUuid: string): Promise<void> {
        // Find the entities to remove
        const entitiesToRemove = await this.postTagRepo.find({
            where: { postUuid },
        });

        // Remove the entities if they exist
        if (entitiesToRemove.length > 0) {
        }
        await this.postTagRepo.remove(entitiesToRemove);
    }

    /**
     * 商品刪除要一起刪除 [Post_Related_Tag]
     * @param storeId
     * @param postId
     * @returns
     */
    async deleteOne(body: DeletePostDto): Promise<void> {
        const { postUuid } = body;
        const post = await this.postRepo.findOne({
            where: { postUuid },
        });
        if (!post) {
            throw new HttpException('查無此商品', HttpStatus.NOT_FOUND);
        }
        await this.removePostCategories(postUuid);
        await this.postRepo.remove(post);
    }
}
