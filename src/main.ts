import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Security
  app.use(
    helmet({
      crossOriginOpenerPolicy: false,
      originAgentCluster: false,
    }),
  );

  // Allow access from host machine / LAN
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://192.168.135.50:3000',
      'http://192.168.135.50',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });

  // Global prefix & versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation
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

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Blood Donation & Emergency Blood Request API')
    .setDescription(
      'Production-ready REST API for a blood donation platform: donor registration, emergency blood requests, automatic compatible-donor matching, and notifications.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Authentication and session management')
    .addTag('Users', 'User profile management')
    .addTag('Blood Types', 'Blood type reference data')
    .addTag('Donor Profiles', 'Donor-specific profile management')
    .addTag('Blood Requests', 'Emergency blood requests')
    .addTag('Donors', 'Nearby donor discovery')
    .addTag('Notifications', 'User notifications')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;

  // Listen on all network interfaces
  await app.listen(port, '0.0.0.0');

  console.log(`🩸 Blood Donation API running on: http://0.0.0.0:${port}/api`);
  console.log(
    `📚 Swagger docs available from host: http://192.168.135.50:${port}/api/docs`,
  );
}

bootstrap();