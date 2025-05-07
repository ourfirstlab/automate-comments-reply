import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { InstagramWebhookController } from './presentation/controllers/instagram-webhook.controller';
import { OpenRouterService } from './infrastructure/services/openrouter.service';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import configuration from './config/configuration';
import { InstagramMediaController } from './presentation/controllers/instagram-media.controller';
import { InstagramMediaService } from './infrastructure/services/instagram-media.service';
import { Comment, CommentSchema } from './domain/models/comment.model';
import { Media, MediaSchema } from './domain/models/media.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
  ],
  controllers: [InstagramWebhookController, InstagramMediaController],
  providers: [
    OpenRouterService,
    {
      provide: 'ILLMService',
      useClass: OpenRouterService,
    },
    InstagramMediaService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('webhook');
  }
}
