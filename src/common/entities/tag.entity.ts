import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { PostTagEntity } from '@src/module/post/entities';

@Entity('Tag')
export class TagEntity extends AuditBaseEntity {
    @PrimaryGeneratedColumn('uuid', {
        name: 'UUID',
        comment: '標籤UUID',
    })
    UUID: string;
    @Column({
        name: 'TagName',
        type: 'nvarchar',
        length: 100,
        comment: '標籤名稱',
    })
    TagName: string;
    @OneToMany(() => PostTagEntity, (postTag) => postTag.Tag)
    PostTags: PostTagEntity[];
}
