import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
class TypeOrmConfig {
    static getDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions {
        console.log('Database Host:', configService.get('POSTGRES.Host'));
        return {
            type: 'postgres',
            host: configService.get<string>('POSTGRES.Host'),
            port: configService.get<number>('POSTGRES.Port'),
            username: configService.get<string>('POSTGRES.Username'),
            password: configService.get<string>('POSTGRES.Password'),
            database: configService.get<string>('POSTGRES.Database'),
            subscribers: ['dist/**/*.subscriber{.ts,.js}'],
            // synchronize: configService.get('NodeEnv') === 'development',
            logging: configService.get('NodeEnv') === 'development' ? ['error', 'warn'] : false,
            autoLoadEntities: true,
            extra: {
                ssl: configService.get('POSTGRES.SSL') === 'true' ? { rejectUnauthorized: false } : false,
            },
            migrations: ['src/database/migration/**/*.ts'], // Define the migration path
        };
    }
}

export const databaseConfigAsync: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> =>
        TypeOrmConfig.getDatabaseConfig(configService),
    inject: [ConfigService],
};
