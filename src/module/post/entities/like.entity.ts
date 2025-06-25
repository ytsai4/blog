import { Entity, PrimaryColumn } from 'typeorm';

@Entity('Like')
export class LikeEntity {
    @PrimaryColumn({
        name: 'Post',
        type: 'uuid',
        comment: '文章UUID',
    })
    Post: string;
    @PrimaryColumn({
        name: 'User',
        type: 'uuid',
        comment: '使用者UUID',
    })
    User: string;
}
