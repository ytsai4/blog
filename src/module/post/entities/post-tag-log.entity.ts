import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PostTagLog')
export class PostTagLogEntity {
    @PrimaryGeneratedColumn('uuid', {
        name: 'UUID',
        comment: 'UUID',
    })
    UUID: string;
    @Column({
        name: 'PostLog',
        type: 'uuid',
        comment: '文章Log UUID',
    })
    Post: string;
    @Column({
        name: 'Tag',
        type: 'uuid',
        comment: '標籤UUID',
    })
    Tag: string;
}
