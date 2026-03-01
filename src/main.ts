import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import setupSwagger from './swagger';
import { MongoDuplicateKeyFilter } from './shared/filters/mongo-duplicate-key.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(
    new MongoDuplicateKeyFilter(httpAdapterHost.httpAdapter),
  );

  // Minha Configuração do seup do sweagger
  await setupSwagger(app);

  const port = Number(configService.get<string>('SERVER_PORT') || 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
