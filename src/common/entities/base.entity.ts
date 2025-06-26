import { CreateDateColumn, DeleteDateColumn } from 'typeorm';

export abstract class AuditBaseEntity {
  @CreateDateColumn({
    name: 'CreateDate',
    type: 'datetime2',
    comment: '建立時間',
  })
  CreateDate: Date;

  @DeleteDateColumn({
    name: 'DeleteDate',
    type: 'datetime2',
    comment: '刪除時間',
    nullable: true,
  })
  DeleteDate: Date | null;
}
