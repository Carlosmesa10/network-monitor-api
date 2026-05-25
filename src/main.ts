import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // ─────────────────────────────────────────────────────────────
  // CORS
  // ─────────────────────────────────────────────────────────────
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ─────────────────────────────────────────────────────────────
  // VALIDACIÓN GLOBAL
  // ─────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─────────────────────────────────────────────────────────────
  // PREFIJO GLOBAL
  // ─────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─────────────────────────────────────────────────────────────
  // SWAGGER
  // ─────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('🌐 Network Monitor API')
    .setDescription(
      'API REST para el Sistema de Monitoreo de Red Empresarial. ' +
        'Recibe métricas desde scripts de monitoreo y las sirve al dashboard web.',
    )
    .setVersion('1.0')
    .addTag('metrics', 'Gestión de métricas de red')
    .addTag('devices', 'Estado y gestión de dispositivos')
    .addTag('health', 'Estado general de la API')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Network Monitor API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
    },
  });

  // ─────────────────────────────────────────────────────────────
  // ARRANQUE
  // ─────────────────────────────────────────────────────────────
  const port = process.env.PORT || 3000;

  await app.listen(port);

  logger.log(`🚀 API corriendo en: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger Docs: http://localhost:${port}/docs`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();