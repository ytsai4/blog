import { AuditBaseEntity } from '@src/common/entities/base.entity';
import { PostTagEntity } from '@src/module/post/entities';
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Post')
export class PostEntity extends AuditBaseEntity {
    @PrimaryGeneratedColumn('uuid', {
        name: 'UUID',
        comment: '文章UUID',
    })
    UUID: string;
    @Column({
        name: 'Title',
        type: 'varchar',
        length: 200,
        comment: '標題',
    })
    Title: string;
    @Column({
        name: 'Content',
        type: 'varchar',
        length: 4000,
        comment: '內文',
    })
    Content: string;
    @Column({
        name: 'PublishDate',
        type: 'timestamp',
        comment: '發布時間',
        nullable: true,
    })
    PublishDate: Date | null;
    @Index()
    @Column({ name: 'CreateBy', type: 'varchar', comment: '作者 UUID' })
    CreateBy: string;

    @OneToMany(() => PostTagEntity, (postTag) => postTag.Post)
    PostTags: PostTagEntity[];
}
