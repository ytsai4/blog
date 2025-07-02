import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { _generateRandomString } from '@src/common/utils/utils';
import { ChangeUserPwdDto, LoginDto, ForgetPasswordDto } from './dto/auth.dto';
import { RequestUserData } from '@src/common/utils/requestData';
import { SysLogEntity } from '../sys-log/entities/sys-log.entity';
import { LogType } from '../sys-log/entities/sys-log.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {}
    // private loginAttempts: Record<string, number> = {};

    /**
     * JWT token 註冊
     * @param payload
     * @returns
     */
    private async certificate(payload: any) {
        return this.jwtService.sign(payload, { secret: process.env.JWT_TOKEN_SECRET });
    }

    /**
     * 使用者驗證
     * @param data
     * @returns
     */
    async userAuthentication(data: LoginDto, requestData: any): Promise<any> {
        const maxLoginAttempts = this.configService.get('maxLoginAttempts');
        const sysName = this.configService.get('sysName');

        const user = await this.userService.getUserByAccount(data.account);
        if (!user) {
            throw new HttpException(`無此帳號`, HttpStatus.FORBIDDEN);
        }

        const userInfo = await this.userService.getAdvancedUserInfo(user.userUuid);

        //save user login log
        const log = new SysLogEntity();
        log.method = requestData ? requestData.method : 'POST';
        log.originalUrl = requestData ? requestData.originalUrl : '/auth/login';
        log.dataId = user.userUuid;
        log.userId = user.userUuid;
        log.account = user.account;
        log.type = LogType.LOGIN;
        log.tag = '失敗';
        log.msg = '登入失敗';
        log.ipv6 = requestData.ipv6 ? requestData.ipv6 : requestData.ip;
        // log.ipv4 = requestData.ipv4 ? requestData.ipv4 : requestData.ip;

        const xForwardedFor = requestData.headers['x-forwarded-for'];
        // 如果存在 X-Forwarded-For 标头，则使用它作为客户端 IP 地址
        // 注意：X-Forwarded-For 可能包含多个 IP 地址，因此您可能需要进一步处理它
        // const clientIp = xForwardedFor ? xForwardedFor.split(',')[0].trim() : requestData.ip;
        const clientIp = requestData.connection.remoteAddress;

        console.log('clientIp:', clientIp);
        log.ipv4 = clientIp;

        if (!userInfo.isEnable) {
            log.tag = '提醒';
            log.msg = '帳號禁用';
            await log.save();
            throw new HttpException(`該帳號已禁用，需請${sysName}處理`, HttpStatus.FORBIDDEN);
        }

        const pwdCheck = await bcrypt.compare(data.password, user.password);
        if (!pwdCheck) {
            // this.loginAttempts[user.userUuid]++;
            // log.msg = `累積密碼錯誤次數:${this.loginAttempts[user.userUuid]}次`;
            log.msg = `累積密碼錯誤`;
            await log.save();
            throw new HttpException(log.msg, HttpStatus.FORBIDDEN);
        }

        user.lastLoginDate = new Date();
        delete user.password;
        await this.userService.saveOne(user);

        // this.loginAttempts[user.userUuid] = 0;

        const payload = {
            userUuid: user.userUuid,
            stores: userInfo.stores,
            roles: userInfo.roles,
        };
        const token = await this.certificate(payload);

        log.tag = '正常';
        log.msg = '登入成功';
        await log.save();

        return {
            token: token,
        };
    }

    /**
     * 使用者更新密碼及記錄變更密碼時間
     * @param data
     */
    async changePwd(userToken: RequestUserData, data: ChangeUserPwdDto): Promise<void> {
        if (data.newPassword !== data.confirmPassword) {
            throw new HttpException('驗證密碼與密碼不同', HttpStatus.BAD_REQUEST);
        }
        const user = await this.userService.findOne({
            where: {
                userUuid: userToken?.userUuid,
            },
            select: ['userUuid', 'password'],
        });

        if (!user) {
            throw new HttpException('查無此使用者', HttpStatus.NOT_FOUND);
        }
        if (!(await bcrypt.compare(data.password, user.password))) {
            throw new HttpException('密碼錯誤', HttpStatus.FORBIDDEN);
        }

        user.lastChangePwdDate = new Date();
        user.password = data.newPassword;

        await this.userService.saveOne(user);
    }

    /**
     * 使用者重置密碼
     * @param data
     */
    async resetPwd(userUuid: string, password: string): Promise<void> {
        const user = await this.userService.findOne({
            where: {
                userUuid,
            },
        });

        if (!user) {
            throw new HttpException('查無此使用者', HttpStatus.NOT_FOUND);
        }

        user.password = password;

        await this.userService.saveOne(user);
    }
}
