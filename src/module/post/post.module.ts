import { Module, forwardRef } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity, TagEntity } from '@src/common/entities';
import { PostLogEntity, PostTagLogEntity, PostTagEntity, LikeEntity } from './entities';
import { CommentService } from '../comment/comment.service';
import { CommentEntity } from '../comment/entities/comment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PostEntity,
            PostTagEntity,
            PostLogEntity,
            TagEntity,
            PostTagLogEntity,
            LikeEntity,
            CommentEntity,
        ]),
    ],
    controllers: [PostController],
    providers: [PostService, CommentService],
    exports: [PostService],
})
export class PostModule {}
