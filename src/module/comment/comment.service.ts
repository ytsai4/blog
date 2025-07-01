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
    QueryRunner,
    Repository,
} from 'typeorm';
import { CommentEntity } from './entities/comment.entity';
import { CommentDto } from './dto/comment.dto';
import { mapToDto } from '@src/common/utils/mapper';

@Injectable()
export class CommentService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(CommentEntity)
        private readonly commentRepo: Repository<CommentEntity>,
    ) {}

    async getFiveByPost(Post: string): Promise<CommentDto[]> {
        const where: FindOptionsWhere<CommentEntity> = {
            DeleteDate: IsNull(),
            Post,
        };
        const queryOptions: FindManyOptions<CommentEntity> = {
            where,
            order: {
                CreateDate: 'DESC',
            },
            take: 5,
        };

        const commentEntities = await this.commentRepo.find(queryOptions);

        const outputData: CommentDto[] = commentEntities.map((comment) => mapToDto(CommentDto, comment));

        return outputData;
    }
    async getByUUID(UUID: string): Promise<CommentDto> {
        const commentEntity = await this.commentRepo.findOne({
            where: {
                DeleteDate: IsNull(),
                UUID,
            },
        });
        const outputData: CommentDto = mapToDto(CommentDto, commentEntity);

        return outputData;
    }

    /**
     * 更新文章
     * @param body
     */
    async update(body: UpdatePostDto): Promise<PostDto> {
        const { Tags, ...rest } = body;
        const postWithTags = await this.postRepo.findOne({
            where: { UUID: rest.UUID },
            relations: ['PostTags', 'PostTags.Tag'],
        });
        if (!postWithTags) {
            throw new NotFoundException('找不到文章');
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
    async create(body: CreatePostDto): Promise<PostDto> {
        const { Tags, ...rest } = body;
        const data = await this.dataSource.transaction(async (entityManager) => {
            const newPost = entityManager.create(PostEntity, rest);
            const post = await entityManager.save(PostEntity, newPost);

            const newPostLog = entityManager.create(PostLogEntity, {
                ...rest,
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
    async like(UUID: string, User: string): Promise<void> {
        const data = await this.likeRepo.findOne({ where: { Post: UUID, User } });
        if (!data) {
            const newLike = this.likeRepo.create({ Post: UUID, User });
            await this.likeRepo.save(newLike);
        } else {
            await this.likeRepo.delete(data);
        }
        return;
    }
}
