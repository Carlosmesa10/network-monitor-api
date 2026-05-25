import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ─── CORS ────────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ─── VALIDACIÓN GLOBAL ───────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Elimina campos no declarados en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay campos extra
      transform: true,           // Transforma tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── PREFIJO GLOBAL ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── SWAGGER / DOCUMENTACIÓN ────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('🌐 Network Monitor API')
    .setDescription(
      'API REST para el Sistema de Monitoreo de Red Empresarial. ' +
      'Recibe métricas desde script Python y las sirve al dashboard Next.js.',
    )
    .setVersion('1.0')
    .addTag('metrics', 'Gestión de métricas de red')
    .addTag('devices', 'Estado y gestión de dispositivos')
    .addTag('health', 'Estado de la API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Network Monitor API Docs',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
    },
  });

  // ─── ARRANQUE ────────────────────────────────────────────────────────────────
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 API corriendo en: http://localhost:${port}/api/v1`);
  logger.log(`📚 Documentación en: http://localhost:${port}/docs`);
  logger.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
