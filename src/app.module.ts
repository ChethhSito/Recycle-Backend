import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { RecyclingModule } from './modules/recycling/recycling.module';
import { AuthModule } from './modules/auth/auth.module';
import { MaterialModule } from './modules/material/material.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/NosPlanetInfo'),
    UsersModule,
    RecyclingModule,
    AuthModule,
    MaterialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
