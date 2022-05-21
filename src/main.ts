import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

(async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptionsCallback = (req, callback) => {
    const corsOptions = { origin: false, credentials: true };
    if (process.env.CORS_ORIGINS.split(',').includes(req.headers.origin)) {
      corsOptions.origin = true;
    }
    callback(null, corsOptions);
  };

  app.enableCors(corsOptionsCallback);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nibyou User Service')
    .setDescription('This service is used to register, manage and notify users')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  return app.listen(
    process.env.PORT || 3000,
    process.env.ENV === 'prod' ? 'node' : 'localhost',
  );
})();
