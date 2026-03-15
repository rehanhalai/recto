import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import cookieParser from "cookie-parser";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix("api");
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.set("trust proxy", 1);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("port") || 8080;
  await app.listen(port);
}
bootstrap();
