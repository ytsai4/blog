import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
// import { ConsoleSeqLogger } from '@jasonsoft/nestjs-seq';
import * as express from 'express';
// import * as helmet from 'helmet';
import * as path from 'path';
import * as glob from 'glob';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    const config = app.get(ConfigService);
    // const logger = app.get(ConsoleSeqLogger);

    setupMiddlewares(app);

    // Enable Swagger only in development environment
    const nodeEnv = config.get<string>('NodeEnv') || 'development';
    if (nodeEnv === 'development') {
        setupSwagger(app);
        // logger.log('Swagger enabled at /api');
    } else {
        // logger.log('Swagger disabled in production');
    }

    const port = config.get<number>('port') || 3000;
    const projectName = config.get<string>('projectName') || 'MyProject';

    try {
        await app.listen(port);
        console.log(`${projectName} 運行在 ${port} 端口`);
        // logger.log(`${projectName} 運行在 ${port} 端口`);
    } catch (error) {
        console.log(`在 ${port} 端口運行失敗`, error);
        // logger.error(`在 ${port} 端口運行失敗`, error);
        process.exit(1);
    }
}

function setupMiddlewares(app: INestApplication): void {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // For development, helmet can be disabled or configured
    // Comment this line out if helmet causes issues in dev
    // app.use(helmet());

    // app.useLogger(app.get(ConsoleSeqLogger));
    app.useGlobalPipes(new ValidationPipe({ transform: true, forbidUnknownValues: true }));
    setupCors(app);
}

function setupCors(app: INestApplication): void {
    const corsOptions: CorsOptions = {
        origin: '*', // allow all origins in dev
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Content-Type-Options',
            'Accept',
            'X-Requested-With',
            'Origin',
            'Access-Control-Request-Method',
            'Access-Control-Request-Headers',
        ],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    };

    app.enableCors(corsOptions);
}

function setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle('Blog API (DEV)')
        .setDescription('API Documentation for Development')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
            'access-token',
        )
        .build();

    const entities = getEntities();
    const schemas = entities.reduce((acc, entity) => {
        const entityName = Object.keys(entity)[0];
        acc[entityName] = entity[entityName];
        return acc;
    }, {});

    const document = SwaggerModule.createDocument(app, config, {
        extraModels: Object.values(schemas),
    });

    SwaggerModule.setup('api', app, document);
}

function getEntities() {
    const entityFiles = glob.sync(path.resolve(__dirname, '../src/common/entities/*.entity.{ts,js}'));
    return entityFiles.map((file) => require(file));
}

bootstrap().catch((error) => {
    // Logger.error('應用程序啟動失敗', error);
    process.exit(1);
});
