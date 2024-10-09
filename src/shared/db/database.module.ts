import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

import { PG_CONNECTION } from '../constant';
import { DatabaseService } from './database.service';

@Module({
  providers: [
    {
      provide: PG_CONNECTION,
      useFactory: (configService: ConfigService) => {
        return new Pool({
          connectionString: configService.get<string>('DATABASE_URL'),
        });
      },
      inject: [ConfigService],
    },
    DatabaseService,
  ],
  exports: [PG_CONNECTION, DatabaseService],
})
export class DatabaseModule {}
