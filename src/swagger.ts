import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync, writeFileSync } from 'fs';

export default async function setupSwagger(
  app: INestApplication,
): Promise<void> {
  const configService = app.get(ConfigService);

  const env = (
    configService.get<string>('NODE_ENV') || 'development'
  ).toLowerCase();

  const appName = configService.get<string>('CLIENT_LIST') || 'Clients API';
  const appVersion = configService.get<string>('APP_VERSION') || '1.0.0';
  const appUrl =
    configService.get<string>('APP_URL') || 'http://localhost:3000';

  const appAuthorName = configService.get<string>('APP_AUTHOR_NAME') || '';
  const appAuthorEmail = configService.get<string>('APP_AUTHOR_EMAIL') || '';

  const docName = configService.get<string>('DOC_NAME') || appName;
  const docDesc =
    configService.get<string>('DOC_DESCRIPTION') || `${appName} documentation`;
  const docVersion =
    configService.get<string>('DOC_OPENAPI_VERSION') || '3.0.0';
  const docPrefix = configService.get<string>('DOC_PREFIX') || '/docs';

  const logger = new Logger(`${appName}-Doc`);

  if (env === 'production') return;

  const documentBuild = new DocumentBuilder()
    .setTitle(docName)
    .setDescription(docDesc)
    .setVersion(appVersion)
    .addServer('/')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'accessToken',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'refreshToken',
    )
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' }, 'xApiKey')
    .build();

  const document = SwaggerModule.createDocument(app, documentBuild, {
    deepScanRoutes: true,
  });

  try {
    mkdirSync('generated', { recursive: true });
    writeFileSync('generated/swagger.json', JSON.stringify(document));
  } catch {}

  SwaggerModule.setup(docPrefix, app, document, {
    jsonDocumentUrl: `${docPrefix}/json`,
    explorer: true,
    customSiteTitle: docName,
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      displayOperationId: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      filter: true,
      deepLinking: true,
    },
  });

  logger.log(`Docs will serve on ${docPrefix}`);
}
