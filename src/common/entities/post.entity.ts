import { AuditBaseEntity } from '@src/common/entities/base.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Post')
export class PostEntity extends AuditBaseEntity {
    @PrimaryGeneratedColumn('uuid', {
        name: 'UUID',
        comment: '文章UUID',
    })
    UUID: string;
    @Column({
        name: 'Title',
        type: 'nvarchar',
        length: 200,
        comment: '標題',
    })
    Title: string;
    @Column({
        name: 'Content',
        type: 'nvarchar',
        length: 4000,
        comment: '內文',
    })
    Content: string;
    @Column({
        name: 'PublishDate',
        type: 'datetime2',
        comment: '發布時間',
        nullable: true,
    })
    PublishDate: Date | null;
    @Index()
    @Column({ name: 'CreateBy', type: 'uuid', comment: '作者 UUID' })
    CreateBy: string;
}
