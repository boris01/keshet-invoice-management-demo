import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HealthModule } from '../health/health.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { InvoiceEntity } from '../invoice/domain/invoice.entity';
import { FileStorageEntity } from '../file-storage/domain/file-storage.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [InvoiceEntity, FileStorageEntity],
      synchronize: true,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
        },
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        if (process.env.REDIS_URL) {
          const KeyvRedis = (await import('@keyv/redis')).default;
          return {
            stores: [new KeyvRedis(process.env.REDIS_URL)],
          };
        }
        return {};
      },
    }),
    EventEmitterModule.forRoot(),
    HealthModule,
    InvoiceModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
