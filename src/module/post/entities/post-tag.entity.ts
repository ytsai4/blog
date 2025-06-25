import { Entity, PrimaryColumn } from 'typeorm';

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
}
