import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import databaseConfig from '../config/database.config';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = configService.get('database');

        if (!dbConfig) {
          throw new Error('Database configuration is missing');
        }

        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [path.join(__dirname, '/../**/*.entity.{ts,js}')],
          synchronize: dbConfig.synchronize,
          logging: dbConfig.logging,
          migrations: [path.join(__dirname, '/../migrations/**/*.{ts,js}')],
          migrationsTableName: 'migrations',
        };
      },
      dataSourceFactory: async (options) => {
        console.log('Database options', options);
        if (!options) throw new Error('Database options missing');
        const dataSource = new DataSource(options);
        await dataSource.initialize();

        return dataSource;
      },
    }),
  ],
})
export class DatabaseModule {}
