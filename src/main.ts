import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  const Port = process.env["APP_PORT"] || 3000;
  await app.listen(Port);
  console.log(`Running on port ${Port} (http://localhost:${Port})`);
}
bootstrap();
