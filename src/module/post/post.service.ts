import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../../common/entities/post.entity';
import {
    And,
    DataSource,
    FindManyOptions,
    FindOptionsWhere,
    In,
    IsNull,
    LessThanOrEqual,
    Like,
    Not,
    Repository,
} from 'typeorm';
import { PostTagEntity } from './entities/post-tag.entity';

import { PostDto } from './dto/post.dto';
import { TagEntity } from '@src/common/entities/tag.entity';
import { mapToDto } from '@src/common/utils/mapper';
import { PostTagLogEntity } from './entities/post-tag-log.entity';
import { PostLogEntity } from './entities/post-log.entity';
import { GetPostDto } from './dto/get-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { LikeEntity } from './entities';
import { PostWithLikes } from './interfaces/post.interface';
import { MetaDto } from '@src/common/dtos/api-response.dto';
@Injectable()
export class PostService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(PostEntity)
        private readonly postRepo: Repository<PostEntity>,

        @InjectRepository(PostTagEntity)
        private readonly postTagRepo: Repository<PostTagEntity>,

        @InjectRepository(PostLogEntity)
        private readonly postLogRepo: Repository<PostLogEntity>,

        @InjectRepository(PostTagLogEntity)
        private readonly postTagLogRepo: Repository<PostTagLogEntity>,

        @InjectRepository(TagEntity)
        private readonly tagRepo: Repository<TagEntity>,
        @InjectRepository(LikeEntity)
        private readonly likeRepo: Repository<LikeEntity>,
    ) {}
    async getPostByTagId(tagIds: string[]): Promise<string[]> {
        const posts = await this.postTagRepo.find({
            where: {
                Tag: In(tagIds),
            },
            select: ['Post'],
        });
        const postIdSet = new Set<string>();
        for (const post of posts) {
            postIdSet.add(post.Post);
        }
        return Array.from(postIdSet);
    }
    async getALlPosts(body: GetPostDto): Promise<{ Data: PostDto[]; Meta: MetaDto }> {
        const { Limit, Offset, Tag, Author, KeyWord } = body;
        const where: FindOptionsWhere<PostEntity>[] = [];
        const baseWhere: FindOptionsWhere<PostEntity> = {
            DeleteDate: IsNull(),
            PublishDate: LessThanOrEqual(new Date()),
        };
        if (Author) {
            where.push({
                ...baseWhere,
                CreateBy: Author,
            });
        }
        if (KeyWord) {
            where.push({
                ...baseWhere,
                Title: And(Not(IsNull()), Like(`%${KeyWord}%`)),
            });
        }
        if (Tag) {
            const posts = await this.getPostByTagId(Tag);
            where.push({
                ...baseWhere,
                UUID: In(posts),
            });
        }
        if (where.length === 0) {
            where.push(baseWhere);
        }
        const queryOptions: FindManyOptions<PostEntity> = {
            where,
            order: {
                PublishDate: 'DESC',
            },
        };
        const total = await this.postRepo.count(queryOptions);
        // Conditionally add pagination
        if (Limit !== undefined && Limit > 0) {
            queryOptions.take = Limit;
            if (Offset !== undefined && Offset >= 0 && Offset < total) {
                queryOptions.skip = Offset;
            }
        }
        const postEntities = await this.postRepo.find(queryOptions);

        const outputData: PostDto[] = postEntities.map((post) => mapToDto(PostDto, post));

        return { Data: outputData, Meta: { Total: total, Limit, Offset } };
    }
    async getPostByUUID(UUID: string): Promise<PostDto> {
        const where: FindOptionsWhere<PostEntity> = {
            DeleteDate: IsNull(),
            PublishDate: LessThanOrEqual(new Date()),
            UUID,
        };
        const queryOptions: FindManyOptions<PostEntity> = {
            where,
            order: {
                PublishDate: 'DESC',
            },
        };
        const postEntity = await this.postRepo.findOne(queryOptions);

        const outputData: PostDto = mapToDto(PostDto, postEntity);

        return outputData;
    }
    async countLikes(UUID: string): Promise<number> {
        const likes = await this.likeRepo.count({
            where: {
                Post: UUID,
            },
        });
        return likes;
    }
    async countLikesGrouped(Posts: PostDto[]): Promise<PostWithLikes[]> {
        if (Posts.length === 0) return [];
        const postUUIDs = Posts.map((post) => post.UUID);

        const likeCounts = await this.likeRepo
            .createQueryBuilder('like')
            .select('like.Post', 'postUUID')
            .addSelect('COUNT(*)', 'likes')
            .where('like.Post IN (:...postUUIDs)', { postUUIDs })
            .groupBy('like.Post')
            .getRawMany<{ postUUID: string; likes: string }>(); // explicitly type raw result

        const likeMap = new Map(likeCounts.map((item) => [item.postUUID, parseInt(item.likes, 10)]));

        const outputs: PostWithLikes[] = Posts.map((post) => ({
            ...post,
            Likes: likeMap.get(post.UUID) || 0,
        }));

        return outputs;
    }
    hashString(value: string | undefined | null): string {
        return createHash('sha256')
            .update(value || '')
            .digest('hex');
    }
    comparePostChange(oldPost: PostLogEntity, newPost: Partial<PostEntity>): boolean {
        if (
            oldPost.Title !== newPost.Title ||
            (oldPost.PublishDate?.toISOString() ?? null) !== (newPost.PublishDate?.toISOString() ?? null) ||
            this.hashString(oldPost.Content) !== this.hashString(newPost.Content)
        ) {
            return true;
        }
        return false;
    }
    compareTagChange(oldTags: string[], newTags: string[]): boolean {
        const oldTagIds = new Set(oldTags);
        const newTagIds = new Set(newTags);
        if (oldTagIds.size !== newTagIds.size) return true;
        for (const tag of oldTags) {
            if (!newTagIds.has(tag)) return true;
        }
        return false;
    }
    /**
     * 更新文章
     * @param body
     */
    async update(body: UpdatePostDto, User: string): Promise<PostDto> {
        const { Tags, ...rest } = body;
        const postWithTags = await this.postRepo.findOne({
            where: { UUID: rest.UUID },
            relations: ['PostTags', 'PostTags.Tag'],
        });
        if (!postWithTags) {
            throw new NotFoundException('找不到文章');
        }
        if (postWithTags.CreateBy !== User) {
            throw new HttpException('你沒有權限更新這篇文章', HttpStatus.FORBIDDEN);
        }
        const oldTagIds = postWithTags.PostTags.map((tag) => tag.Tag);
        const tagChange = this.compareTagChange(oldTagIds, Tags ?? []);

        const postLog = await this.postLogRepo.findOne({
            where: { UUID: postWithTags.UUID },
            order: { CreateDate: 'DESC' },
        });
        if (!postLog) {
            throw new NotFoundException('找不到文章');
        }
        const postChange = this.comparePostChange(postLog, rest);
        if (!postChange && !tagChange) {
            throw new HttpException('文章沒有變更', HttpStatus.BAD_REQUEST);
        }
        await this.dataSource.transaction(async (entityManager) => {
            const newPostLog = entityManager.create(PostLogEntity, {
                ...rest,
            });
            await entityManager.insert(PostLogEntity, newPostLog);

            if (tagChange) {
                // Remove old post-tag relations
                await entityManager.delete(PostTagEntity, {
                    Post: postWithTags.UUID,
                });
                if (Tags && Tags.length > 0) {
                    // Create new post-tag entities using `.create()` to trigger hooks/defaults
                    const newPostTags = Tags.map((tagId) =>
                        entityManager.create(PostTagEntity, {
                            Post: postWithTags.UUID,
                            Tag: tagId,
                        }),
                    );
                    await entityManager.insert(PostTagEntity, newPostTags);
                    // Create post-tag logs (one per tag), again using `.create()`
                    const newPostTagLogs = Tags.map((tagId) =>
                        entityManager.create(PostTagLogEntity, {
                            Post: newPostLog.UUID, // log points to the new PostLog record
                            Tag: tagId,
                        }),
                    );
                    await entityManager.insert(PostTagLogEntity, newPostTagLogs);
                }
            }

            await entityManager.update(PostEntity, rest.UUID, rest);
        });
        const post = await this.postRepo.findOne({
            where: { UUID: rest.UUID },
        });
        const outputData: PostDto = mapToDto(PostDto, post);
        return outputData;
    }
    /**
     * 新增文章
     * @param body
     */
    async create(body: CreatePostDto, User: string): Promise<PostDto> {
        const { Tags, ...rest } = body;
        const data = await this.dataSource.transaction(async (entityManager) => {
            const newPost = entityManager.create(PostEntity, { ...rest, CreateBy: User });
            const post = await entityManager.save(PostEntity, newPost);

            const newPostLog = entityManager.create(PostLogEntity, {
                ...rest,
                CreateBy: User,
                Post: post.UUID,
            });
            await entityManager.insert(PostLogEntity, newPostLog);

            if (Tags && Tags.length > 0) {
                // Create new post-tag entities using `.create()` to trigger hooks/defaults
                const newPostTags = Tags.map((tagId) =>
                    entityManager.create(PostTagEntity, {
                        Post: newPost.UUID,
                        Tag: tagId,
                    }),
                );
                await entityManager.insert(PostTagEntity, newPostTags);
                // Create post-tag logs (one per tag), again using `.create()`
                const newPostTagLogs = Tags.map((tagId) =>
                    entityManager.create(PostTagLogEntity, {
                        Post: newPostLog.UUID, // log points to the new PostLog record
                        Tag: tagId,
                    }),
                );
                await entityManager.insert(PostTagLogEntity, newPostTagLogs);
            }

            return post;
        });

        const outputData: PostDto = mapToDto(PostDto, data);
        return outputData;
    }
    // like/unlike
    async like(UUID: string, User: string): Promise<number> {
        const data = await this.likeRepo.findOne({ where: { Post: UUID, User } });
        if (!data) {
            const newLike = this.likeRepo.create({ Post: UUID, User });
            await this.likeRepo.save(newLike);
        } else {
            await this.likeRepo.delete(data);
        }
        const like_count = await this.likeRepo.count({ where: { Post: UUID } });
        return like_count;
    }
    async delete(UUID: string, User: string): Promise<void> {
        const data = await this.postRepo.findOne({ where: { UUID } });
        if (!data) {
            throw new NotFoundException('找不到文章');
        }
        if (data.CreateBy !== User) {
            throw new HttpException('你沒有權限刪除', HttpStatus.FORBIDDEN);
        }
        await this.postRepo.update({ UUID }, { DeleteDate: new Date() });

        return;
    }
}
