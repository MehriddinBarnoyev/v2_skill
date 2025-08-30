import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { configureCloudinary } from 'cloudinary.config';

async function bootstrap() {
  dotenv.config();
  configureCloudinary();

  const app = await NestFactory.create(AppModule);

  // ✅ cors paketini ishlatish
  app.use(cors());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Skill Exchange API')
    .setDescription('API for skill exchange platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(4000);
}
bootstrap();
