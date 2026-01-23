import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; // <--- 1. IMPORTANTE: Importar esto
import { CloudinaryModule } from './common/cloudinary.module';
import { UsersModule } from './modules/users/users.module';
import { RecyclingModule } from './modules/recycling/recycling.module';
import { AuthModule } from './modules/auth/auth.module';
import { MaterialModule } from './modules/material/material.module';
import { InductionModule } from './modules/induction/induction.module';
import { PartnersModule } from './modules/partners/partners.module';
import { LevelsModule } from './modules/level/levels.module';
import { ProgramsModule } from './modules/programs/programs.module';

@Module({
  imports: [
    // 2. IMPORTANTE: Esto carga el archivo .env antes que todo lo demás
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que funcione en todos tus módulos (Auth, Users, etc.) sin reimportarlo
    }),

    // Ahora sí leerá process.env.MONGO_URI correctamente del archivo .env
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/NosPlanetInfo'),
    CloudinaryModule,
    UsersModule,
    RecyclingModule,
    AuthModule,
    MaterialModule,
    LevelsModule,
    InductionModule,
    PartnersModule,
    ProgramsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }