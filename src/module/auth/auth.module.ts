import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '@src/common/guards/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@src/common/entities/user.entity';
import { UserService } from '../user/user.service';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_TOKEN_SECRET,
            signOptions: {
                expiresIn: process.env.JWT_TOKEN_EXPIRES_IN ?? '1d',
            },
        }),
        TypeOrmModule.forFeature([UserEntity]),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, UserService],
    exports: [AuthService],
})
export class AuthModule {}
