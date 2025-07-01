import { AuditBaseEntity } from '@src/common/entities/base.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Comment')
export class CommentEntity extends AuditBaseEntity {
    @PrimaryGeneratedColumn('uuid', {
        name: 'UUID',
        comment: '留言UUID',
    })
    UUID: string;
    @Index()
    @Column({ name: 'Post', type: 'uuid', comment: '文章 UUID' })
    Post: string;

    @Column({
        name: 'Content',
        type: 'nvarchar',
        length: 4000,
        comment: '內文',
    })
    Content: string;
    @Column({ name: 'CreateBy', type: 'uuid', comment: '留言者 UUID' })
    CreateBy: string;

    @Column({ name: 'DeleteBy', type: 'uuid', comment: '刪除者 UUID', nullable: true })
    DeleteBy: string;
}
