import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuditBaseEntity } from './base.entity';

@Entity('User')
export class UserEntity extends AuditBaseEntity {
    @PrimaryGeneratedColumn('uuid', {
        name: 'UUID',
        comment: '使用者UUID',
    })
    UUID: string;
    @Column({
        name: 'UserName',
        type: 'nvarchar',
        length: 100,
        comment: '使用者帳號',
        unique: true,
    })
    UserName: string;

    @Column({
        name: 'Intro',
        type: 'nvarchar',
        length: 255,
        comment: '介紹文字',
        default: '',
    })
    Intro: string;
    @Column({
        name: 'Name',
        type: 'nvarchar',
        length: 100,
        comment: '名稱',
        default: '',
    })
    Name: string;
    @Column({
        name: 'Password',
        type: 'nvarchar',
        length: 200,
        comment: '密碼',
    })
    Password: string;

    @Column({
        name: 'Email',
        type: 'nvarchar',
        length: 200,
        comment: '信箱',
        default: '',
    })
    Email: string;

    @Column({ name: 'LastLoginDate', type: 'timestamp', nullable: true })
    LastLoginDate: Date | null;
    @Column({ name: 'LastChangePwdDate', type: 'timestamp', nullable: true })
    LastChangePwdDate: Date | null;
    @Column({ name: 'CreateBy', type: 'uuid', comment: '作者 UUID' })
    CreateBy: string;
    @Column({ name: 'DeleteBy', type: 'uuid', comment: '刪除者', nullable: true })
    DeleteBy: string;

    @BeforeInsert()
    @BeforeUpdate()
    async setPassword?(password: string) {
        if (this.Password) {
            // Check if password looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
            const isHashed =
                this.Password.startsWith('$2a$') ||
                this.Password.startsWith('$2b$') ||
                this.Password.startsWith('$2y$');

            if (!isHashed) {
                const salt = await bcrypt.genSalt();
                this.Password = await bcrypt.hash(password || this.Password, salt);
            }
        }
    }
}
