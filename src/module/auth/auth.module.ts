import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '@src/common/guards/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@src/common/entities/user.entity';
import { UserService } from '../user/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule, // <-- import ConfigModule to inject ConfigService
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule], // import ConfigModule here too
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT.Secret'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT.ExpiresIn') ?? '1d',
                },
            }),
        }),
        TypeOrmModule.forFeature([UserEntity]),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, UserService],
    exports: [AuthService],
})
export class AuthModule {}
