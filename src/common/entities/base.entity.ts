import { CreateDateColumn, DeleteDateColumn } from 'typeorm';

export abstract class AuditBaseEntity {
    @CreateDateColumn({
        name: 'CreateDate',
        type: 'timestamp',
        comment: '建立時間',
    })
    CreateDate: Date;

    @DeleteDateColumn({
        name: 'DeleteDate',
        type: 'timestamp',
        comment: '刪除時間',
        nullable: true,
    })
    DeleteDate: Date | null;
}
