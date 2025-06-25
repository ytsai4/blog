import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
class TypeOrmConfig {
    static getDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions {
        console.log('Database Host:', configService.get('database.host'));
        return {
            type: 'mariadb',
            host: configService.get<string>('MARIADB.Host'),
            port: configService.get<number>('MARIADB.Port'),
            username: configService.get<string>('MARIADB.Username'),
            password: configService.get<string>('MARIADB.Password'),
            database: configService.get<string>('MARIADB.Database'),
            timezone: '+08:00', // Asia/Taipei 時區
            subscribers: ['dist/**/*.subscriber{.ts,.js}'],
            synchronize: configService.get('NodeEnv') === 'development', 
            logging: configService.get('NodeEnv') === 'development' ? ['error', 'warn'] : false,
            autoLoadEntities: true,
            extra: {
                trustServerCertificate: true,
                charset: 'utf8',
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

