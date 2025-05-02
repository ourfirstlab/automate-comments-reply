import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ILLMService } from '../../domain/services/llm.service.interface';

@Injectable()
export class OpenRouterService implements ILLMService {
    private readonly openai: OpenAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('openRouter.apiKey');
        if (!apiKey) {
            throw new Error('OpenRouter API key is not configured');
        }

        this.openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: apiKey,
            defaultHeaders: {
                'HTTP-Referer': this.configService.get<string>('app.url') || 'http://localhost:3000',
                'X-Title': 'Instagram Comment Automation',
            },
            defaultQuery: {
                'prompt_training': 'true', // Explicitly enable prompt training
            },
        });
    }

    async generateResponse(prompt: string): Promise<string> {
        try {
            const model = this.configService.get<string>('openRouter.model') || 'mistralai/mistral-7b-instruct';

            const completion = await this.openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that generates friendly and engaging responses to Instagram comments.',
                    },
                    {
                        role: 'user',
                        content: `Please generate a friendly response to this Instagram comment: "${prompt}"`,
                    },
                ],
                temperature: 0.7,
                max_tokens: 150,
            });

            const response = completion.choices[0].message.content;
            if (!response) {
                throw new Error('No response generated from OpenRouter');
            }

            return response;
        } catch (error: any) {
            console.error('Error generating response:', error);

            if (error?.status === 404 && error?.error?.message?.includes('data policy')) {
                throw new Error(
                    'OpenRouter requires prompt training to be enabled. ' +
                    'Please visit https://openrouter.ai/settings/privacy to enable it.'
                );
            }

            if (error?.status === 401) {
                throw new Error('Invalid OpenRouter API key. Please check your configuration.');
            }

            throw new Error('Failed to generate response from OpenRouter: ' + (error?.message || 'Unknown error'));
        }
    }
} 