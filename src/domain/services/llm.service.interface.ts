export interface ILLMService {
    generateResponse(comment: string, mediaContext?: { caption?: string; type?: string }): Promise<string>;
} 