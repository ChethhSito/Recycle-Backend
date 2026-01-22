import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // <--- NECESARIO para los DTOs

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. EL PREFIJO GLOBAL (¡CRUCIAL!)
  // Esto agrega '/api' al inicio de todas tus rutas automáticamente.
  // Ahora tu AuthController responderá en: localhost:3000/api/auth/google
  app.setGlobalPrefix('api');

  // 2. CORS
  // Permite que peticiones de otros orígenes (como tu App móvil) entren al servidor
  app.enableCors();

  // 3. VALIDACIÓN GLOBAL
  // Esto activa las reglas que pusiste en los DTOs (@IsString, @IsEmail, etc.)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina datos que no estén en el DTO (seguridad)
    forbidNonWhitelisted: true, // Tira error si envían datos basura
  }));

  // --- CONFIGURACIÓN SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('Nos Sac Backend')
    .setDescription('API documentation for Nos Sac')
    .setVersion('1.0')
    .addBearerAuth() // <--- Recomendado agregar esto para probar JWTs luego
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Cambié la ruta de la documentación a 'api/docs'
  // Entras en: http://localhost:3000/api/docs
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();