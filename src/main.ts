import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const docsPath = 'docs';

  const config = new DocumentBuilder()
    .setTitle('Chat Sentiment API')
    .setDescription(
      'API for analyzing customer sentiment from chat conversations',
    )
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(docsPath, app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);

  const appUrl = await app.getUrl();
  logger.log(`Application is running on: ${appUrl}`);
  logger.log(`Swagger documentation is available at: ${appUrl}/${docsPath}`);
}
bootstrap();
