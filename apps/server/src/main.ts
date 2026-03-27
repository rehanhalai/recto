import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import cookieParser from "cookie-parser";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import rateLimit from "express-rate-limit";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>("clientUrl") || "http://localhost:3000",
    credentials: true,
  });

  app.setGlobalPrefix("api");
  app.set("trust proxy", 1);

  // Stricter limits for auth endpoints to reduce brute-force and OTP abuse.
  app.use(
    "/api/auth",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        message: "Too many auth requests. Please try again later.",
      },
    }),
  );

  // Baseline API rate limit for all endpoints.
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        message: "Too many requests. Please slow down and try again.",
      },
    }),
  );

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = configService.get<number>("port") || 8080;
  await app.listen(port);
}
bootstrap();
