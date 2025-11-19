import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from '../controllers/app.controller';
import { APIController } from '../controllers/api.controller';
import { AppService } from '../services/app.service';
import { DatabaseModule } from '../database/database.module';
import { MigrationService } from '../services/migration.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'views'),
    }),
    DatabaseModule
  ],
  controllers: [AppController, APIController],
  providers: [AppService, MigrationService],
})
export class AppModule { }
