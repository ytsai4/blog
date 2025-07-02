import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../../common/entities/post.entity';
import { FindManyOptions, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { CommentEntity } from './entities/comment.entity';
import { CommentDto } from './dto/comment.dto';
import { mapToDto } from '@src/common/utils/mapper';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(CommentEntity)
        private readonly commentRepo: Repository<CommentEntity>,
        @InjectRepository(PostEntity)
        private readonly postRepo: Repository<PostEntity>,
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
    async getAllByPost(Post: string): Promise<CommentDto[]> {
        const where: FindOptionsWhere<CommentEntity> = {
            DeleteDate: IsNull(),
            Post,
        };
        const queryOptions: FindManyOptions<CommentEntity> = {
            where,
            order: {
                CreateDate: 'DESC',
            },
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
     * 新增留言
     * @param body
     */
    async create(body: CreateCommentDto, User: string): Promise<CommentDto> {
        const comment = this.commentRepo.create({ ...body, CreateBy: User });
        const result = await this.commentRepo.save(comment);
        const outputData: CommentDto = mapToDto(CommentDto, result);
        return outputData;
    }

    async delete(UUID: string, User: string): Promise<void> {
        const data = await this.commentRepo.findOne({ where: { UUID, DeleteDate: IsNull() } });
        if (!data) {
            throw new NotFoundException('找不到留言');
        }
        const post = await this.postRepo.findOne({ where: { UUID: data.Post, DeleteDate: IsNull() } });
        if (!post) {
            throw new NotFoundException('找不到文章');
        }
        if (data.CreateBy !== User || post.CreateBy !== User) {
            throw new HttpException('你沒有權限刪除', HttpStatus.FORBIDDEN);
        }
        await this.commentRepo.update({ UUID }, { DeleteDate: new Date(), DeleteBy: User });
        return;
    }
}
