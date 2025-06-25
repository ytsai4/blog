import { DisplayEntity } from '@src/modules/_base/entities/display.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Comment')
export class CommentEntity extends DisplayEntity {
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

    @Column({ name: 'CreateDate', type: 'datetime2', comment: '建立時間' })
    CreateDate: Date;

    @Column({ name: 'DeleteBy', type: 'uuid', comment: '刪除者 UUID', nullable: true })
    DeleteBy: string;

    @Column({ name: 'DeleteDate', type: 'datetime2', comment: '刪除時間', nullable: true })
    DeleteDate: Date;
}
