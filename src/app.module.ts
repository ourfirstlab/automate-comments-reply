import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InstagramWebhookController } from './presentation/controllers/instagram-webhook.controller';
import { OpenRouterService } from './infrastructure/services/openrouter.service';
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
export class AppModule { }
