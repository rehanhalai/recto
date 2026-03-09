import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    console.log("App Module loaded successfully post-slug removal");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
bootstrap();
