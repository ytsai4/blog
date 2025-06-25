import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@src/modules/_base/entities/base.entity';

@Entity('User')
export class UserEntity extends BaseEntity {
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
        select: false,
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

    @Column({ name: 'CreateDate', type: 'datetime2', comment: '建立時間' })
    CreateDate: Date;

    @Column({ name: 'DeleteBy', type: 'uuid', comment: '刪除者', nullable: true })
    DeleteBy: string;

    @Column({ name: 'DeleteDate', type: 'datetime2', comment: '刪除時間', nullable: true })
    DeleteDate: Date;
    @BeforeInsert()
    @BeforeUpdate()
    async setPassword?(password: string) {
        if (this.Password) {
            const salt = await bcrypt.genSalt();
            this.Password = await bcrypt.hash(password || this.Password, salt);
        }
    }
}
