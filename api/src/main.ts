import * as dotenv from 'dotenv';
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🛡️ 1. Habilitando o CORS (Essencial para o Vite se comunicar com o NestJS)
  app.enableCors({
    // Na sua máquina será localhost:5173, em produção será a URL da sua Vercel/Netlify
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Necessário se formos usar cookies JWT no futuro
  });

  // 🛡️ 2. Ativando a Validação Global Estrita (Blindagem de DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Arranca fora qualquer campo que não esteja no DTO (evita injeção de dados)
      forbidNonWhitelisted: true, // Retorna erro 400 se enviarem lixo no payload
      transform: true, // Transforma os payloads automaticamente para as instâncias das classes DTO
    }),
  );

  // 📚 3. Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Gerenciador de Dívidas')
    .setDescription('API para controle e projeção de dívidas')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Aplicação rodando em: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `📚 Swagger disponível em: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}

bootstrap().catch((err) => {
  console.error('Erro ao iniciar a aplicação:', err);
});
