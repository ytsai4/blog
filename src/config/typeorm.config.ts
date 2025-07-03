import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
class TypeOrmConfig {
    static getDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions {
        const db = configService.get('POSTGRE');
        console.log('Database Host:', db?.Host);
        return {
            type: 'postgres',
            host: db.Host,
            port: parseInt(db.Port, 10) || db.Port,
            username: db.Username,
            password: db.Password,
            database: db.Database,
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
