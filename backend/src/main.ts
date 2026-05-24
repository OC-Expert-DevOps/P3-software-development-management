import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  
  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // supprime les champs non définis dans les DTO
      forbidNonWhitelisted: true, // renvoie une erreur si des champs non définis sont envoyés
      transform: true, // transforme les payloads selon les types DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
