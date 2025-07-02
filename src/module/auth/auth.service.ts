import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@src/module/user/user.service';
import { LoginDto } from './dto/log-in.dto';
import { ConfigService } from '@nestjs/config';
import { Token } from '@src/common/interfaces/request.interface';

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
     * 註冊使用者
     * @param data
     * @returns
     */
    async create(data: LoginDto): Promise<Token> {
        const user = await this.userService.create(data);

        const payload = {
            UUID_User: user.UUID,
        };
        const token = await this.certificate(payload);

        return {
            Token: token,
        };
    }
    /**
     * 使用者驗證
     * @param data
     * @returns
     */
    async userAuthentication(data: LoginDto): Promise<Token> {
        const { UserName, Password } = data;
        const user = await this.userService.getByUserName(UserName);
        if (!user) {
            throw new HttpException(`無此帳號`, HttpStatus.FORBIDDEN);
        }

        const pwdCheck = await bcrypt.compare(Password, user.Password);
        if (!pwdCheck) {
            throw new HttpException('密碼錯誤', HttpStatus.FORBIDDEN);
        }

        await this.userService.updateLogDate(user.UUID);

        const payload = {
            UUID_User: user.UUID,
        };
        const token = await this.certificate(payload);

        return {
            Token: token,
        };
    }
}
