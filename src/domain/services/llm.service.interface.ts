export interface ILLMService {
    generateResponse(prompt: string): Promise<string>;
} 