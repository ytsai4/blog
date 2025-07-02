import { PostEntity, TagEntity } from '@src/common/entities';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('PostTag')
export class PostTagEntity {
    @PrimaryColumn({
        name: 'Post',
        type: 'uuid',
        comment: '文章UUID',
    })
    Post: string;
    @PrimaryColumn({
        name: 'Tag',
        type: 'uuid',
        comment: '標籤UUID',
    })
    Tag: string;
    @ManyToOne(() => PostEntity, (post) => post.PostTags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'PostId' })
    Posts: PostEntity;

    @ManyToOne(() => TagEntity, (tag) => tag.PostTags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'TagId' })
    Tags: TagEntity;
}
