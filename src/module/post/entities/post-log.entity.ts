import { DisplayEntity } from '@src/modules/_base/entities/display.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PostLog')
export class PostLogEntity extends DisplayEntity {
    @PrimaryGeneratedColumn('uuid', {
        name: 'UUID',
        comment: '文章UUID',
    })
    UUID: string;
    @Index()
    @Column({ name: 'Post', type: 'uuid', comment: '文章 UUID' })
    Post: string;
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

    @Column({ name: 'UpdateDate', type: 'datetime2', comment: '更新時間' })
    UpdateDate: Date;
}
