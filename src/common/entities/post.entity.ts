import { DisplayEntity } from '@src/modules/_base/entities/display.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Post')
export class PostEntity extends DisplayEntity {
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

    @Column({ name: 'CreateDate', type: 'datetime2', comment: '建立時間' })
    CreateDate: Date;

    @Column({ name: 'UpdateDate', type: 'datetime2', comment: '更新時間', nullable: true })
    UpdateDate: Date | null;

    @Column({ name: 'DeleteDate', type: 'datetime2', comment: '刪除時間', nullable: true })
    DeleteDate: Date | null;
}
