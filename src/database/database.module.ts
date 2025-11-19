import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasienEMR } from '../entities/emr.pasien.entity';
import { PasienSIMRS } from '../entities/simrs.pasien.entity';

@Module({
  imports: [

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'emr',
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +(configService.get<number>('DATABASE_PORT') || 5432),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME_EMR'),
        synchronize: +configService.get('PRODUCTION_MODE') ? false : true,
        entities: [PasienEMR],
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'simrs',
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +(configService.get<number>('DATABASE_PORT') || 5432),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME_SIMRS'),
        synchronize: +configService.get('PRODUCTION_MODE') ? false : true,
        entities: [PasienSIMRS],
      }),
      inject: [ConfigService],
    }),
    
  ],
})
export class DatabaseModule { }
