import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Tag')
export class TagEntity {
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
}
