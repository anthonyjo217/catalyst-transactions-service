import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: [
      'https://ts.tissini.build',
      'https://ts.tissini.cloud',
      'https://seller.tissini.build',
      'https://seller.tissini.cloud',
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost:8081',
    ], // TODO pass to env
  });
  const port = process.env.PORT || 3030;
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '1mb' }));
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableCircularCheck: true,
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(port);
  Logger.log(`🚀 USER-SERVICE IS RUNNING IN PORT: ${port}`);
}
bootstrap();
