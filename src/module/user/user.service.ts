import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IsNull, Repository } from 'typeorm';
import { UserEntity } from '@src/common/entities/user.entity';
import { UserDto } from './dto/user.dto';
import { mapToDto } from '@src/common/utils/mapper';
import { LoginDto } from '../auth/dto/log-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
    ) {}

    async getByUserName(UserName: string): Promise<UserEntity | null> {
        const userEntity = await this.userRepo.findOne({
            where: {
                DeleteDate: IsNull(),
                UserName,
            },
        });

        return userEntity;
    }
    async findOne(UUID: string): Promise<UserDto> {
        const userEntity = await this.getByUUID(UUID);

        const outputData: UserDto = mapToDto(UserDto, userEntity);

        return outputData;
    }
    async getByUUID(UUID: string): Promise<UserEntity> {
        const userEntity = await this.userRepo.findOne({
            where: {
                DeleteDate: IsNull(),
                UUID,
            },
        });
        if (!userEntity) {
            throw new HttpException('查無此使用者', HttpStatus.NOT_FOUND);
        }
        return userEntity;
    }
    async create(data: LoginDto): Promise<UserDto> {
        const duplicate = await this.getByUserName(data.UserName);
        if (duplicate) {
            throw new HttpException(`帳號已存在`, HttpStatus.CONFLICT);
        }
        const user = this.userRepo.create({ ...data, CreateBy: 'System' });

        user.LastChangePwdDate = new Date();
        user.LastLoginDate = new Date();
        const result = await this.userRepo.save(user);
        const outputData: UserDto = mapToDto(UserDto, result);
        return outputData;
    }
    async update(UUID: string, data: UpdateUserDto): Promise<UserDto> {
        const user = await this.findOne(UUID);

        // Check for duplicate username
        if (data.UserName && data.UserName !== user.UserName) {
            const duplicate = await this.getByUserName(data.UserName);
            if (duplicate && duplicate.UUID !== UUID) {
                throw new HttpException('帳號已存在', HttpStatus.CONFLICT);
            }
        }

        await this.userRepo.update({ UUID }, data); // Perform partial update

        const updatedUser = await this.userRepo.findOne({ where: { UUID } });
        return mapToDto(UserDto, updatedUser);
    }
    async updateLogDate(UUID: string): Promise<void> {
        const user = await this.getByUUID(UUID);
        user.LastLoginDate = new Date();
        await this.userRepo.save(user);

        return;
    }
    /**
     * 使用者更新密碼及記錄變更密碼時間
     * @param data
     */
    async changePwd(User: string, data: ChangePasswordDto): Promise<void> {
        if (data.NewPassword !== data.ConfirmPassword) {
            throw new HttpException('驗證密碼與密碼不同', HttpStatus.BAD_REQUEST);
        }
        const user = await this.getByUUID(User);

        if (!user) {
            throw new HttpException('查無此使用者', HttpStatus.NOT_FOUND);
        }
        if (!(await bcrypt.compare(data.Password, user.Password))) {
            throw new HttpException('密碼錯誤', HttpStatus.FORBIDDEN);
        }

        user.LastChangePwdDate = new Date();
        user.Password = data.NewPassword;

        await this.userRepo.save(user);
        return;
    }
}
