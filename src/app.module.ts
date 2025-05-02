import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InstagramWebhookController } from './presentation/controllers/instagram-webhook.controller';
import { OpenRouterService } from './infrastructure/services/openrouter.service';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
  controllers: [InstagramWebhookController],
  providers: [
    OpenRouterService,
    {
      provide: 'ILLMService',
      useClass: OpenRouterService,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('webhook');
  }
}
