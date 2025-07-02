import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { PostModule } from './module/post/post.module';
import { CommentModule } from './module/comment/comment.module';
import { databaseConfigAsync } from './config/typeorm.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env.development.local', '.env'],
            load: [configuration],
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync(databaseConfigAsync),
        AuthModule,
        UserModule,
        PostModule,
        CommentModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                transform: true, // 自動轉換型別
                transformOptions: {
                    enableImplicitConversion: true, // 啟用隱式轉換
                },
                whitelist: true, // 移除未定義的屬性
                forbidNonWhitelisted: true, // 當出現未定義的屬性時拋出錯誤
                validateCustomDecorators: true, // 驗證自定義裝飾器
            }),
        },
        {
            provide: 'APP_FILTER',
            useClass: AllExceptionsFilter,
        },
        {
            provide: 'APP_GUARD',
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
