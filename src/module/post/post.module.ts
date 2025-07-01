import { Module, forwardRef } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity, TagEntity } from '@src/common/entities';
import { PostLogEntity, PostTagLogEntity, PostTagEntity } from './entities';

@Module({
    imports: [TypeOrmModule.forFeature([PostEntity, PostTagEntity, PostLogEntity, TagEntity, PostTagLogEntity])],
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService],
})
export class PostModule {}
