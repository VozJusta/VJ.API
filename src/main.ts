import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Voz Justa')
    .setDescription('Voz Justa API')
    .setVersion('1.0')
    .addTag('Citizen', 'Trade-related routes')
    .addTag('Lawyer', 'Routes related to Lawyer')
    .addTag('Auth', 'Routes related to authentication and authorization')
    .addTag('Report', 'Trade-related routes')
    .addTag('Ingestion', 'Routes related to data ingestion')
    .addTag('Dashboard', 'Password-secret creation route')
    .addTag(
      'Refresh',
      'Refresh token endpoint: validates the current token and returns a new access token.',
    )
    .addBearerAuth()
    .build();

  app.enableCors({
    origin: ['http://localhost:3000', 'https://vozjusta.com.br'],
    methods: ['GET', 'PATCH', 'DELETE', 'POST', 'PUT'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-security-token',
      'access-token',
    ],
    exposedHeaders: ['x-security-token', 'X-security-token', 'access-token'],
    credentials: true,
  });

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3001, () => {
    console.log(
      `Application is running on: http://localhost:${process.env.PORT ?? 3001}`,
    );
  });
}
bootstrap();
